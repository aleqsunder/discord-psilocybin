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
import {Like} from 'typeorm'

interface CommandResponseBody {
	name: string
	value: string
}

interface ResponseBody {
	name: string
	value: number
}

async function commandList(interaction: AutocompleteInteraction): Promise<void> {
	const commandTemp: AutocompleteFocusedOption = interaction.options.getFocused(true)
	const commands: PsilocybinCommand[] = list.filter(command => command.name.includes(commandTemp.value))
	const commandsResponse: CommandResponseBody[] = commands.map(command => ({
		name: command.name,
		value: command.name,
	}))

	await interaction.respond(commandsResponse)
}

export async function itemAutocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
	const itemTemp: AutocompleteFocusedOption = interaction.options.getFocused(true)
	const items: Item[] = await ItemRepository.getList(1, 10, {
		name: itemTemp.value,
		serverId: interaction.guildId
	})

	const itemsResponse: ResponseBody[] = items.map(item => ({
		name: item.name,
		value: item.id
	}))

	await interaction.respond(itemsResponse)
}

export async function itemQualityAutocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
	const qualityTemp: AutocompleteFocusedOption = interaction.options.getFocused(true)
	const qualities: ItemQuality[] = await ItemQualityRepository.find({
		where: {
			name: Like(`%${qualityTemp.value}%`),
			serverId: interaction.guildId!,
		},
		take: 10,
	})

	const qualitiesResponse: ResponseBody[] = qualities.map(quality => ({
		name: quality.name,
		value: quality.id,
	}))

	await interaction.respond(qualitiesResponse)
}

export async function caseAutocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
	const groupTemp: AutocompleteFocusedOption = interaction.options.getFocused(true)
	const groups: ItemGroup[] = await ItemGroupRepository.getList(1, 10, {
		name: groupTemp.value,
		serverId: interaction.guildId
	})

	const groupsResponse: ResponseBody[] = groups.map(group => ({
		name: group.name,
		value: group.id,
	}))

	await interaction.respond(groupsResponse)
}

export async function userItemAutocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
	const member = interaction.member as GuildMember
	const userItemTemp: AutocompleteFocusedOption = interaction.options.getFocused(true)
	const inventoryItems: InventoryItem[] = await InventoryItemRepository.getList(1, 10, {
		name: userItemTemp.value,
		serverId: interaction.guildId,
		userId: member.id,
	})

	const itemsResponse: ResponseBody[] = inventoryItems.map(inventoryItem => ({
		name: inventoryItem.item.name,
		value: inventoryItem.id,
	}))

	await interaction.respond(itemsResponse)
}

export async function effectItemAutocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
	const member = interaction.member as GuildMember
	const effectItemTemp: AutocompleteFocusedOption = interaction.options.getFocused(true)
	const inventoryItems: InventoryItem[] = await InventoryItemRepository.getEffectLikeList(1, 10, {
		name: effectItemTemp.value,
		serverId: interaction.guildId,
		userId: member.id,
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
			value: inventoryItem.id
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
		case 'user-item': return await userItemAutocompleteHandler(interaction)
		case 'effect-item': return await effectItemAutocompleteHandler(interaction)

		default: throw new Error(`Несуществующий автокомплит ${focused.name}`)
	}
}
