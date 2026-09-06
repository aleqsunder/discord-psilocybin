import {AttachmentBuilder, ButtonInteraction, MessageFlagsBitField, Snowflake} from 'discord.js'
import {MuhomorUser} from '../../entities/MuhomorUser'
import MuhomorUserRepository from '../../repositories/MuhomorUserRepository'
import {CasinoPlayer} from '../../entities/psilocybin/CasinoPlayer'
import CasinoPlayerRepository from '../../repositories/CasinoPlayerRepository'
import {CasinoBank} from '../../entities/psilocybin/CasinoBank'
import CasinoBankRepository from '../../repositories/CasinoBankRepository'
import {CasinoSession} from '../../entities/psilocybin/CasinoSession'
import CasinoSessionRepository from '../../repositories/CasinoSessionRepository'
import {CasinoState, SpinOutcome} from '../../utils/casino/engine'
import {formatSpinning, formatSpinResult} from '../../utils/casino/format'
import {formatMoney} from '../../utils/formatUtils'
import {createPreparedSpin, ensurePreparedSpin, PreparedSpin, takePreparedSpin} from '../../services/CasinoSpinCache'
import {getSymbolSet} from '../../services/CasinoSymbolService'
import {SymbolSet} from '../../utils/casino/config'
import {buildSessionRow, TOP_UP_PREFIX} from './spin'
import {topUpButtonHandler} from './topup'

async function replyEphemeral(interaction: ButtonInteraction, content: string): Promise<void> {
    await interaction.reply({content, flags: MessageFlagsBitField.Flags.Ephemeral})
}

function toState(bank: CasinoBank, session: CasinoSession): CasinoState {
    return {
        bankSpent: bank.totalSpent,
        bankWon: bank.totalWon,
        dryStreak: session.dryStreak,
    }
}

// Заранее подготовленный спин забираем из кэша, а если его нет — считаем на месте
async function resolveSpin(
    messageId: Snowflake,
    symbols: SymbolSet,
    state: CasinoState,
    bet: number
): Promise<PreparedSpin> {
    const prepared: Promise<PreparedSpin>|null = takePreparedSpin(messageId)
    if (!prepared) {
        return createPreparedSpin(symbols, state, bet)
    }

    try {
        return await prepared
    } catch (error) {
        console.error('Подготовленный спин оказался негодным, считаем заново:', error)
        return createPreparedSpin(symbols, state, bet)
    }
}

async function spinButtonHandler(interaction: ButtonInteraction, ownerId: Snowflake): Promise<void> {
    if (interaction.user.id !== ownerId) {
        await replyEphemeral(interaction, `Это казино запустил <@${ownerId}>, крутить может только он`)
        return
    }

    const messageId: Snowflake = interaction.message.id
    const session: CasinoSession|null = await CasinoSessionRepository.getByMessageId(messageId)
    if (!session) {
        await replyEphemeral(interaction, 'Эта игра больше недоступна, запустите новую через `/casino spin`')
        return
    }

    // Владельца берём из сессии, а не из кнопки: в базе он достовернее
    if (session.userId !== interaction.user.id) {
        await replyEphemeral(interaction, `Это казино запустил <@${session.userId}>, крутить может только он`)
        return
    }

    if (session.spinsLeft <= 0) {
        await replyEphemeral(interaction, 'Спины в этой игре закончились, купите ещё через `/casino spin`')
        return
    }

    const bank: CasinoBank = await CasinoBankRepository.getOrCreate(session.serverId)
    const symbols: SymbolSet = await getSymbolSet(session.serverId)
    const {outcome, gif, durationMs}: PreparedSpin = await resolveSpin(messageId, symbols, toState(bank, session), session.bet)

    // Во время прокрутки показываем только уменьшившийся остаток спинов:
    // выигрыш и фриспины этого спина раскроются в конце
    const sessionWonBefore: number = session.sessionWon
    session.spinsLeft--
    const spinsLeftDuringSpin: number = session.spinsLeft

    session.sessionWon += outcome.total
    session.dryStreak = outcome.total > 0 ? 0 : session.dryStreak + 1

    if (outcome.freeSpins > 0) {
        session.spinsLeft += outcome.freeSpins
        session.spinsBought += outcome.freeSpins
    }

    const user: MuhomorUser = await MuhomorUserRepository.getCurrentUser(interaction)
    if (outcome.total > 0) {
        user.points = formatMoney(user.points + outcome.total)
        await user.save()
    }

    // Выигрыш уходит из общего банка сервера
    bank.totalWon += outcome.total
    await bank.save()

    const player: CasinoPlayer = await CasinoPlayerRepository.getOrCreate(session.serverId, session.userId)
    player.totalWon += outcome.total
    await player.save()

    await session.save()

    // Одним запросом: блокируем кнопку и сразу отдаём гифку. Гифка готова заранее,
    // поэтому лишний round-trip на промежуточное сообщение не нужен
    await interaction.update({
        content: formatSpinning(session.userId, session.bet, spinsLeftDuringSpin, sessionWonBefore),
        files: [new AttachmentBuilder(gif, {name: 'casino-spin.gif'})],
        components: [buildSessionRow(session.userId, true, spinsLeftDuringSpin)],
    })

    // Следующую гифку рендерим уже после отправки: рендер занимает поток
    // и иначе задержал бы отдачу текущей
    if (session.spinsLeft > 0) {
        ensurePreparedSpin(messageId, session.serverId, symbols, toState(bank, session), session.bet)
    }

    const outcomeSnapshot: SpinOutcome = outcome
    const spinsLeft: number = session.spinsLeft
    const sessionWon: number = session.sessionWon
    const bet: number = session.bet
    const userId: Snowflake = session.userId

    // Итог показываем ровно тогда, когда гифка досмотрена, и там же возвращаем кнопку.
    //
    // Вложение при этом НЕ трогаем: при смене вложения дискорд пересоздаёт элемент с картинкой,
    // и гифка успевает прокрутиться с начала, пока грузится замена. Гифка не зациклена и
    // замирает на кадре с подсветкой комбинаций, то есть она сама и есть картинка результата —
    // менять её не на что. Без files в запрос не уходит поле attachments, и вложение остаётся прежним
    setTimeout(async () => {
        try {
            await interaction.editReply({
                content: formatSpinResult(symbols, userId, outcomeSnapshot, bet, spinsLeft, sessionWon),
                components: [buildSessionRow(userId, false, spinsLeft)],
            })
        } catch (error) {
            console.error('Не удалось показать результат спина:', error)
        }
    }, durationMs)
}

export async function casinoButtonHandler(interaction: ButtonInteraction, subcommand: string, option: string): Promise<void> {
    if (subcommand.startsWith(TOP_UP_PREFIX)) {
        return await topUpButtonHandler(interaction, option, Number(subcommand.slice(TOP_UP_PREFIX.length)))
    }

    switch (subcommand) {
        case 'spin': return await spinButtonHandler(interaction, option)
        default: throw new Error(`Несуществующая сабкоманда ${subcommand} (button)`)
    }
}
