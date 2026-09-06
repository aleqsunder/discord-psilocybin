import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Message,
    Snowflake,
} from 'discord.js'
import {MuhomorUser} from '../../entities/MuhomorUser'
import MuhomorUserRepository from '../../repositories/MuhomorUserRepository'
import {CasinoPlayer} from '../../entities/psilocybin/CasinoPlayer'
import CasinoPlayerRepository from '../../repositories/CasinoPlayerRepository'
import {CasinoBank} from '../../entities/psilocybin/CasinoBank'
import CasinoBankRepository from '../../repositories/CasinoBankRepository'
import {CasinoSession} from '../../entities/psilocybin/CasinoSession'
import {calculateSpinCost, generateGrid, Grid} from '../../utils/casino/engine'
import {MAX_BET, MAX_SPINS_PER_PURCHASE, MIN_BET, SPIN_COST} from '../../utils/casino/config'
import {renderField} from '../../utils/casino/render'
import {formatPurchase} from '../../utils/casino/format'
import {ensurePreparedSpin} from '../../services/CasinoSpinCache'
import {getSymbolSet} from '../../services/CasinoSymbolService'
import {SymbolSet} from '../../utils/casino/config'
import {formatMoney, formatPoints} from '../../utils/formatUtils'
import {POINTS_EMOJI} from '../../constants'

export const SPIN_BUTTON_LABEL: string = 'Спин'
// Кнопки додепа докупают спины в ту же сессию, поэтому счётчик в customId — их количество
export const TOP_UP_PREFIX: string = 'topup-'
export const TOP_UP_AMOUNTS: number[] = [1, MAX_SPINS_PER_PURCHASE]

// Во время прокрутки блокируется всё, после неё «Спин» оживает только при наличии спинов,
// а додеп доступен всегда — иначе с нулём спинов из сессии было бы не выбраться
export function buildSessionRow(userId: Snowflake, locked: boolean, spinsLeft: number): ActionRowBuilder<ButtonBuilder> {
    const spinButton = new ButtonBuilder()
        .setCustomId(`casino:spin:${userId}`)
        .setLabel(SPIN_BUTTON_LABEL)
        .setEmoji('🎰')
        .setStyle(ButtonStyle.Success)
        .setDisabled(locked || spinsLeft <= 0)

    const topUpButtons: ButtonBuilder[] = TOP_UP_AMOUNTS.map((amount: number) =>
        new ButtonBuilder()
            .setCustomId(`casino:${TOP_UP_PREFIX}${amount}:${userId}`)
            .setLabel(`+${amount} додеп`)
            .setEmoji(POINTS_EMOJI)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(locked)
    )

    return new ActionRowBuilder<ButtonBuilder>().addComponents(spinButton, ...topUpButtons)
}

export async function buySpinsHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()

    const count: number = Math.min(interaction.options.getNumber('count') ?? 1, MAX_SPINS_PER_PURCHASE)
    const bet: number = Math.min(Math.max(interaction.options.getNumber('bet') ?? SPIN_COST, MIN_BET), MAX_BET)
    const cost: number = calculateSpinCost(count, bet)

    const user: MuhomorUser = await MuhomorUserRepository.getCurrentUser(interaction)
    if (user.points < cost) {
        await interaction.editReply(
            `Не хватает поинтов: нужно ${formatPoints(cost)} ${POINTS_EMOJI}, а на балансе ${formatPoints(user.points)} ${POINTS_EMOJI}`
        )
        return
    }

    user.points = formatMoney(user.points - cost)
    await user.save()

    const player: CasinoPlayer = await CasinoPlayerRepository.getOrCreate(interaction.guildId!, interaction.user.id)
    player.totalSpent += cost
    await player.save()

    // Деньги за спины уходят в общий банк сервера — из него же платятся выигрыши
    const bank: CasinoBank = await CasinoBankRepository.getOrCreate(interaction.guildId!)
    bank.totalSpent += cost
    await bank.save()

    const symbols: SymbolSet = await getSymbolSet(interaction.guildId!)
    const grid: Grid = generateGrid(symbols)
    const attachment = new AttachmentBuilder(await renderField(symbols, grid), {name: 'casino.png'})

    const message: Message = await interaction.editReply({
        content: formatPurchase(interaction.user.id, bet, count),
        files: [attachment],
        components: [buildSessionRow(interaction.user.id, false, count)],
    })

    // Спины живут в сообщении: параллельные игры одного игрока друг о друге не знают
    const session = new CasinoSession()
    session.messageId = message.id
    session.serverId = interaction.guildId!
    session.userId = interaction.user.id
    session.spinsLeft = count
    session.spinsBought = count
    session.sessionSpent = cost
    session.bet = bet
    session.createdAt = Date.now()
    await session.save()

    // Первую гифку рендерим заранее, пока игрок разглядывает поле
    ensurePreparedSpin(message.id, interaction.guildId!, symbols, {
        bankSpent: bank.totalSpent,
        bankWon: bank.totalWon,
        dryStreak: session.dryStreak,
    }, bet)
}
