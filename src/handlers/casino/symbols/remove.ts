import {ChatInputCommandInteraction} from 'discord.js'
import {CasinoSymbol} from '../../../entities/psilocybin/CasinoSymbol'
import CasinoSymbolRepository from '../../../repositories/CasinoSymbolRepository'
import {invalidateSymbolSet} from '../../../services/CasinoSymbolService'

export async function removeCasinoSymbolHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const symbolId: number = interaction.options.getNumber('casino-symbol', true)
    const serverId: string = interaction.guildId!

    const symbol: CasinoSymbol|null = await CasinoSymbolRepository.findOneBy({id: symbolId, serverId})
    if (!symbol) {
        await interaction.editReply('Символ не найден')
        return
    }

    // Без фруктов барабану нечего показывать, поэтому последний символ удалить нельзя
    const count: number = await CasinoSymbolRepository.getListCount({serverId})
    if (count <= 1) {
        await interaction.editReply('Нельзя удалить последний символ: в казино должен остаться хотя бы один')
        return
    }

    const name: string = symbol.name
    await symbol.remove()

    invalidateSymbolSet(serverId)
    await interaction.editReply(`Символ «${name}» удалён из казино`)
}
