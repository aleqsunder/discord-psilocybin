import {AutocompleteFocusedOption, AutocompleteInteraction} from 'discord.js'
import {ItemGroup} from '../../entities/psilocybin/ItemGroup'
import ItemGroupRepository from '../../repositories/ItemGroupRepository'

export async function caseAutocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
    const groupTemp: AutocompleteFocusedOption = interaction.options.getFocused(true)
    const groups: ItemGroup[] = await ItemGroupRepository.getList(1, 10, {
        name: groupTemp.value,
        serverId: interaction.guildId
    })

    const groupsResponse: NumberResponseBody[] = groups.map(group => ({
        name: group.name,
        value: group.id,
    }))

    await interaction.respond(groupsResponse)
}
