import {AutocompleteFocusedOption, AutocompleteInteraction, GuildMember} from 'discord.js'
import {InventoryItem} from '../../entities/psilocybin/InventoryItem'
import InventoryItemRepository from '../../repositories/InventoryItemRepository'
import {Item} from '../../entities/psilocybin/Item'
import {AbstractEffect} from '../../effects/abstractEffect'

export async function effectItemAutocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
    const member = interaction.member as GuildMember
    const effectItemTemp: AutocompleteFocusedOption = interaction.options.getFocused(true)
    const inventoryItems: InventoryItem[] = await InventoryItemRepository.getEffectLikeList(1, 10, {
        name: effectItemTemp.value,
        serverId: interaction.guildId,
        userId: member.id,
    })

    const itemsResponse: NumberResponseBody[] = inventoryItems.map(inventoryItem => {
        const item: Item = inventoryItem.item
        const effect: AbstractEffect|null = item.getEffect()

        let name: string = item.name
        if (effect) {
            name += ` (${effect.getName()})`
        }

        return {
            name: name,
            value: inventoryItem.id
        }
    })

    await interaction.respond(itemsResponse)
}
