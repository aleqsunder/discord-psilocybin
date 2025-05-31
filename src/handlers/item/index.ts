import {ChatInputCommandInteraction} from 'discord.js'
import {createItemHandler} from './createItem'
import {editItemHandler} from './editItem'
import {listItemHandler} from './list'
import {removeItemHandler} from './remove'
import {infoItemHandler} from './infoItem'

export async function itemAdminHandler(interaction: ChatInputCommandInteraction): Promise<void> {
	const subcommand: string = interaction.options.getSubcommand()
	switch (subcommand) {
		case 'create': return await createItemHandler(interaction)
		case 'edit': return await editItemHandler(interaction)
		case 'remove': return await removeItemHandler(interaction)
		default: throw new Error(`Подкоманда "${subcommand}" не найдена`)
	}
}

export async function itemHandler(interaction: ChatInputCommandInteraction): Promise<void> {
	await interaction.deferReply()

	const subcommand: string = interaction.options.getSubcommand()
	switch (subcommand) {
		case 'list': return await listItemHandler(interaction)
		case 'info': return await infoItemHandler(interaction)
		default: throw new Error(`Подкоманда "${subcommand}" не найдена`)
	}
}
