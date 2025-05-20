import {AutocompleteFocusedOption, AutocompleteInteraction, GuildMember} from 'discord.js'
import {Item} from '../entities/psilocybin/Item'
import ItemRepository from '../repositories/ItemRepository'
import {ItemQuality} from '../entities/psilocybin/ItemQuality'
import ItemQualityRepository from '../repositories/ItemQualityRepository'
import ItemGroupRepository from '../repositories/ItemGroupRepository'
import {ItemGroup} from '../entities/psilocybin/ItemGroup'
import {list} from '../commands/list'
import {AbstractEffect} from '../effects/abstractEffect'
import {InventoryItem} from '../entities/psilocybin/InventoryItem'
import InventoryItemRepository from '../repositories/InventoryItemRepository'
import {InviteCreateOptions} from 'discord.js/typings'

interface ResponseBody {
	name: string
	value: string
}

async function commandList(interaction: AutocompleteInteraction): Promise<void> {
	const commandTemp: AutocompleteFocusedOption = interaction.options.getFocused(true)
	const commands: PsilocybinCommand[] = list.filter(command => command.name.includes(commandTemp.value))
	const commandsResponse: ResponseBody[] = commands.map(command => ({
		name: command.name,
		value: command.name,
	}))

	await interaction.respond(commandsResponse)
}

export async function itemAutocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
	const itemTemp: AutocompleteFocusedOption = interaction.options.getFocused(true)
	const items: Item[] = await ItemRepository.getList(1, 6, {
		name: itemTemp.value,
		serverId: interaction.guildId
	})

	const itemsResponse: ResponseBody[] = items.map(item => ({
		name: item.name,
		value: String(item.id)
	}))

	await interaction.respond(itemsResponse)
}

export async function itemQualityAutocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
	const qualityTemp: AutocompleteFocusedOption = interaction.options.getFocused(true)
	const qualities: ItemQuality[] = await ItemQualityRepository.searchByName(qualityTemp.value)
	const qualitiesResponse: ResponseBody[] = qualities.map(quality => ({
		name: quality.name,
		value: String(quality.id),
	}))

	await interaction.respond(qualitiesResponse)
}

export async function caseAutocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
	const groupTemp: AutocompleteFocusedOption = interaction.options.getFocused(true)
	const groups: ItemGroup[] = await ItemGroupRepository.getList(1, 6, {
		name: groupTemp.value,
		serverId: interaction.guildId
	})

	const groupsResponse: ResponseBody[] = groups.map(group => ({
		name: group.name,
		value: String(group.id),
	}))

	await interaction.respond(groupsResponse)
}

export async function effectItemAutocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
	const effectItemTemp: AutocompleteFocusedOption = interaction.options.getFocused(true)
	const member = interaction.member as GuildMember
	const inventoryItems: InventoryItem[] = await InventoryItemRepository.getList(1, 6, {
		name: effectItemTemp.value,
		serverId: interaction.guildId,
		userId: member.id,
		groupBy: 'effect'
	})

	const itemsResponse: ResponseBody[] = inventoryItems.map(inventoryItem => {
		const item: Item = inventoryItem.item
		const effect: AbstractEffect|null = item.getEffect()

		let name: string = item.name
		if (effect) {
			name += ` (${effect.getName()})`
		}

		return {
			name: name,
			value: String(inventoryItem.id)
		}
	})

	await interaction.respond(itemsResponse)
}

export async function autocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
	const focused: AutocompleteFocusedOption = interaction.options.getFocused(true)
	switch (focused.name) {
		case 'item': return await itemAutocompleteHandler(interaction)
		case 'quality': return await itemQualityAutocompleteHandler(interaction)
		case 'case': return await caseAutocompleteHandler(interaction)
		case 'command': return await commandList(interaction)
		case 'effect-item': return await effectItemAutocompleteHandler(interaction)

		default: throw new Error(`Несуществующий автокомплит ${focused.name}`)
	}
}
