import {AutocompleteFocusedOption, AutocompleteInteraction} from 'discord.js'
import {CasinoSymbol} from '../../entities/psilocybin/CasinoSymbol'
import CasinoSymbolRepository from '../../repositories/CasinoSymbolRepository'

export async function casinoSymbolAutocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
    const focused: AutocompleteFocusedOption = interaction.options.getFocused(true)
    const symbols: CasinoSymbol[] = await CasinoSymbolRepository.getList(1, 10, {
        name: focused.value,
        serverId: interaction.guildId,
    })

    const response: NumberResponseBody[] = symbols.map((symbol: CasinoSymbol) => ({
        name: symbol.name,
        value: symbol.id,
    }))

    await interaction.respond(response)
}
