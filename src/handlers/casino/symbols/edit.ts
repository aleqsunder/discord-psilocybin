import {Attachment, ChatInputCommandInteraction} from 'discord.js'
import {CasinoSymbol} from '../../../entities/psilocybin/CasinoSymbol'
import CasinoSymbolRepository from '../../../repositories/CasinoSymbolRepository'
import {saveImageToStorage} from '../../../utils/imageUtils'
import {DEFAULT_CASINO_CATALOG} from '../../../constants'
import {invalidateSymbolSet} from '../../../services/CasinoSymbolService'
import {formatSymbolCard} from './format'

export async function editCasinoSymbolHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const symbolId: number = interaction.options.getNumber('casino-symbol', true)
    const symbol: CasinoSymbol|null = await CasinoSymbolRepository.findOneBy({
        id: symbolId,
        serverId: interaction.guildId!,
    })

    if (!symbol) {
        await interaction.editReply('Символ не найден')
        return
    }

    const name: string|null = interaction.options.getString('name')
    if (name) {
        symbol.name = name.trim()
    }

    // Ноль — валидное значение, поэтому проверяем именно на отсутствие опции
    const weight: number|null = interaction.options.getNumber('weight')
    if (weight !== null) {
        symbol.weight = weight
    }

    const payout: number|null = interaction.options.getNumber('payout')
    if (payout !== null) {
        symbol.payout = payout
    }

    const image: Attachment|null = interaction.options.getAttachment('image')
    if (image) {
        symbol.imagePath = await saveImageToStorage(symbol.id, image, DEFAULT_CASINO_CATALOG)
    }

    await symbol.save()

    invalidateSymbolSet(symbol.serverId)
    await formatSymbolCard(interaction, symbol, `Символ «${symbol.name}» обновлён`)
}
