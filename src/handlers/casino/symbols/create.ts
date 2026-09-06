import {Attachment, ChatInputCommandInteraction} from 'discord.js'
import {CasinoSymbol} from '../../../entities/psilocybin/CasinoSymbol'
import {saveImageToStorage} from '../../../utils/imageUtils'
import {DEFAULT_CASINO_CATALOG} from '../../../constants'
import {invalidateSymbolSet} from '../../../services/CasinoSymbolService'
import {formatSymbolCard} from './format'

const DEFAULT_WEIGHT: number = 10

export async function createCasinoSymbolHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const name: string = interaction.options.getString('name', true).trim()
    const image: Attachment = interaction.options.getAttachment('image', true)

    const symbol = new CasinoSymbol()
    symbol.serverId = interaction.guildId!
    symbol.name = name
    // Картинка кладётся в хранилище под id символа, поэтому сначала нужна запись
    symbol.imagePath = ''
    symbol.weight = interaction.options.getNumber('weight') ?? DEFAULT_WEIGHT
    symbol.payout = interaction.options.getNumber('payout') ?? 0
    await symbol.save()

    try {
        symbol.imagePath = await saveImageToStorage(symbol.id, image, DEFAULT_CASINO_CATALOG)
        await symbol.save()
    } catch (error) {
        console.error('Не удалось сохранить картинку символа:', error)

        await symbol.remove()
        await interaction.editReply('Не удалось сохранить картинку, символ не добавлен')
        return
    }

    invalidateSymbolSet(symbol.serverId)
    await formatSymbolCard(interaction, symbol, `Символ «${symbol.name}» добавлен в казино`)
}
