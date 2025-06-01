import {AutocompleteFocusedOption, AutocompleteInteraction, GuildMember} from 'discord.js'
import {InventoryItem} from '../../entities/psilocybin/InventoryItem'
import InventoryItemRepository from '../../repositories/InventoryItemRepository'

export async function userItemAutocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
    const member = interaction.member as GuildMember
    const userItemTemp: AutocompleteFocusedOption = interaction.options.getFocused(true)
    const inventoryItems: InventoryItem[] = await InventoryItemRepository.getList(1, 10, {
        name: userItemTemp.value,
        serverId: interaction.guildId,
        userId: member.id,
    })

    const itemsResponse: NumberResponseBody[] = inventoryItems.map(inventoryItem => ({
        name: inventoryItem.item.name,
        value: inventoryItem.id,
    }))

    await interaction.respond(itemsResponse)
}
