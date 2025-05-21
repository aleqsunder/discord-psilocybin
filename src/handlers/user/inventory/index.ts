import {ChatInputCommandInteraction} from 'discord.js'
import {listItemHandler} from './list'
import {addItemInInventoryHandler} from './add'
import {useItemInInventoryHandler} from './use'
import {sellItemInInventoryHandler} from './sell'
import {removeItemInInventoryHandler} from './remove'

export async function inventoryHandler(interaction: ChatInputCommandInteraction) {
	const subcommand: string = interaction.options.getSubcommand()
	switch (subcommand) {
		case 'list': return await listItemHandler(interaction)
		case 'add': return await addItemInInventoryHandler(interaction)
		case 'use': return await useItemInInventoryHandler(interaction)
		case 'sell': return await sellItemInInventoryHandler(interaction)
		case 'remove': return await removeItemInInventoryHandler(interaction)
		default: throw new Error(`Подкоманда "${subcommand}" не найдена`)
	}
}
