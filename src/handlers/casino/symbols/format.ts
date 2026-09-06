import {AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder} from 'discord.js'
import path from 'path'
import {CasinoSymbol} from '../../../entities/psilocybin/CasinoSymbol'
import {LENGTH_BONUS, MIN_LINE_LENGTH} from '../../../utils/casino/config'
import {formatMoney} from '../../../utils/formatUtils'

export const SYMBOL_EMBED_COLOR: number = 0x6EE7F9

export function formatChance(weight: number, totalWeight: number): string|null {
    if (weight <= 0 || totalWeight <= 0) {
        return null
    }

    return `${(weight / totalWeight * 100).toFixed(1)}%`
}

export function formatPayouts(symbol: CasinoSymbol): string {
    if (symbol.payout <= 0) {
        return 'выплат нет'
    }

    // Показываем базу и во что она превращается на длинных линиях
    const lengths: string = Object.entries(LENGTH_BONUS)
        .filter(([length]) => Number(length) > MIN_LINE_LENGTH)
        .map(([length, bonus]) => `${length} → x${formatMoney(symbol.payout * bonus, 2)}`)
        .join(' · ')

    return `x${symbol.payout} · ${lengths}`
}

export async function formatSymbolCard(
    interaction: ChatInputCommandInteraction,
    symbol: CasinoSymbol,
    title: string
): Promise<void> {
    const imagePath: string = symbol.getImagePath()
    const fileName: string = path.basename(imagePath)
    const attachment = new AttachmentBuilder(imagePath, {name: fileName})

    const embed = new EmbedBuilder()
        .setTitle(title)
        .addFields(
            {name: 'Вес выпадения', value: String(symbol.weight), inline: true},
            {name: 'Выплата', value: formatPayouts(symbol), inline: true},
        )
        .setThumbnail(`attachment://${fileName}`)
        .setFooter({text: `id: ${symbol.id}`})
        .setColor(SYMBOL_EMBED_COLOR)

    await interaction.editReply({embeds: [embed], files: [attachment]})
}
