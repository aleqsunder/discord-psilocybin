import {AutocompleteFocusedOption, AutocompleteInteraction} from 'discord.js'
import {Item} from '../../entities/psilocybin/Item'
import ItemRepository from '../../repositories/ItemRepository'

export async function itemAutocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
    const itemTemp: AutocompleteFocusedOption = interaction.options.getFocused(true)
    const items: Item[] = await ItemRepository.getList(1, 10, {
        name: itemTemp.value,
        serverId: interaction.guildId
    })

    const itemsResponse: NumberResponseBody[] = items.map(item => ({
        name: item.name,
        value: item.id
    }))

    await interaction.respond(itemsResponse)
}
