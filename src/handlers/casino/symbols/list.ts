import {AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder} from 'discord.js'
import {CasinoSymbol} from '../../../entities/psilocybin/CasinoSymbol'
import CasinoSymbolRepository from '../../../repositories/CasinoSymbolRepository'
import {generateList, ListItemConfig} from '../../../utils/inventoryUtils'
import {getSymbolSet} from '../../../services/CasinoSymbolService'
import {BONUS_SYMBOLS, SpinSymbol, SymbolSet} from '../../../utils/casino/config'
import {formatChance, formatPayouts, SYMBOL_EMBED_COLOR} from './format'

const PER_PAGE: number = 8

export async function listCasinoSymbolsHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const serverId: string = interaction.guildId!

    // Набор поднимаем через сервис: он же заведёт стандартные символы новому серверу
    const symbolSet: SymbolSet = await getSymbolSet(serverId)
    const totalWeight: number = symbolSet.all.reduce((sum: number, symbol: SpinSymbol) => sum + symbol.weight, 0)

    const count: number = await CasinoSymbolRepository.getListCount({serverId})
    if (count === 0) {
        await interaction.editReply('В казино нет ни одного символа')
        return
    }

    const pages: number = Math.ceil(count / PER_PAGE)
    const page: number = interaction.options.getNumber('page') ?? 1
    if (page > pages) {
        await interaction.editReply(`Страница ${page} не входит в диапазон страниц от 1 до ${pages}`)
        return
    }

    const symbols: CasinoSymbol[] = await CasinoSymbolRepository.getList(page, PER_PAGE, {serverId})
    const lines: string[] = symbols.map((symbol: CasinoSymbol) => {
        // Символ с нулевым весом никогда не выпадет, поэтому шанс у него не показываем
        const chance: string|null = formatChance(symbol.weight, totalWeight)
        const chanceText: string = chance ? ` — шанс ${chance}` : ''

        return `**#${symbol.id} ${symbol.name}**${chanceText}\n-# вес ${symbol.weight} · ${formatPayouts(symbol)}`
    })

    const bonuses: string = BONUS_SYMBOLS
        .map((symbol: SpinSymbol) => {
            const chance: string|null = formatChance(symbol.weight, totalWeight)
            return `${symbol.name}${chance ? ` — ${chance}` : ''}`
        })
        .join('\n')

    const embed = new EmbedBuilder()
        .setTitle('🎰 Символы казино')
        .setDescription(lines.join('\n\n'))
        .addFields({name: 'Бонусы (не редактируются)', value: bonuses})
        .setFooter({text: `Страница ${page} из ${pages} · всего символов: ${count}`})
        .setColor(SYMBOL_EMBED_COLOR)

    const list: ListItemConfig[] = symbols.map((symbol: CasinoSymbol) => ({
        imagePath: symbol.getImagePath(),
        name: symbol.name,
        description: formatChance(symbol.weight, totalWeight) ?? 'не выпадает',
    }))

    const attachment: AttachmentBuilder = await generateList(list, {rows: 2, itemsInRow: 4})
    await interaction.editReply({embeds: [embed], files: [attachment]})
}
