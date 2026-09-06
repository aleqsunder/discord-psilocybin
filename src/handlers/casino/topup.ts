import {ButtonInteraction, MessageFlagsBitField, Snowflake} from 'discord.js'
import {MuhomorUser} from '../../entities/MuhomorUser'
import MuhomorUserRepository from '../../repositories/MuhomorUserRepository'
import {CasinoPlayer} from '../../entities/psilocybin/CasinoPlayer'
import CasinoPlayerRepository from '../../repositories/CasinoPlayerRepository'
import {CasinoBank} from '../../entities/psilocybin/CasinoBank'
import CasinoBankRepository from '../../repositories/CasinoBankRepository'
import {CasinoSession} from '../../entities/psilocybin/CasinoSession'
import CasinoSessionRepository from '../../repositories/CasinoSessionRepository'
import {calculateSpinCost} from '../../utils/casino/engine'
import {MAX_SPINS_PER_PURCHASE, SymbolSet} from '../../utils/casino/config'
import {formatTopUp} from '../../utils/casino/format'
import {formatMoney, formatPoints} from '../../utils/formatUtils'
import {POINTS_EMOJI} from '../../constants'
import {ensurePreparedSpin} from '../../services/CasinoSpinCache'
import {getSymbolSet} from '../../services/CasinoSymbolService'
import {buildSessionRow} from './spin'

async function replyEphemeral(interaction: ButtonInteraction, content: string): Promise<void> {
    await interaction.reply({content, flags: MessageFlagsBitField.Flags.Ephemeral})
}

export async function topUpButtonHandler(
    interaction: ButtonInteraction,
    ownerId: Snowflake,
    count: number
): Promise<void> {
    if (!Number.isInteger(count) || count <= 0 || count > MAX_SPINS_PER_PURCHASE) {
        throw new Error(`Некорректное количество спинов для додепа: ${count}`)
    }

    if (interaction.user.id !== ownerId) {
        await replyEphemeral(interaction, `Это казино запустил <@${ownerId}>, докупать спины может только он`)
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
        await replyEphemeral(interaction, `Это казино запустил <@${session.userId}>, докупать спины может только он`)
        return
    }

    // Докупаем по той же ставке, что была выбрана при запуске игры
    const cost: number = calculateSpinCost(count, session.bet)
    const user: MuhomorUser = await MuhomorUserRepository.getCurrentUser(interaction)
    if (user.points < cost) {
        await replyEphemeral(
            interaction,
            `Не хватает поинтов: нужно ${formatPoints(cost)} ${POINTS_EMOJI}, а на балансе ${formatPoints(user.points)} ${POINTS_EMOJI}`
        )
        return
    }

    user.points = formatMoney(user.points - cost)
    await user.save()

    // Спины падают в ту же сессию, что и купленные изначально
    session.spinsLeft += count
    session.spinsBought += count
    session.sessionSpent += cost
    await session.save()

    const player: CasinoPlayer = await CasinoPlayerRepository.getOrCreate(session.serverId, session.userId)
    player.totalSpent += cost
    await player.save()

    const bank: CasinoBank = await CasinoBankRepository.getOrCreate(session.serverId)
    bank.totalSpent += cost
    await bank.save()

    await interaction.update({
        content: formatTopUp(session.userId, count, session.bet, session.spinsLeft, session.sessionWon),
        components: [buildSessionRow(session.userId, false, session.spinsLeft)],
    })

    // Гифку следующего спина готовим сразу: игрок явно собирается крутить дальше
    const symbols: SymbolSet = await getSymbolSet(session.serverId)
    ensurePreparedSpin(messageId, session.serverId, symbols, {
        bankSpent: bank.totalSpent,
        bankWon: bank.totalWon,
        dryStreak: session.dryStreak,
    }, session.bet)
}
