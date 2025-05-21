import {ChatInputCommandInteraction} from 'discord.js'
import {createItemHandler} from './createItem'
import {editItemHandler} from './editItem'
import {listItemHandler} from './list'
import {removeItemHandler} from './remove'

export async function itemHandler(interaction: ChatInputCommandInteraction): Promise<void> {
	await interaction.deferReply()

	const subcommand: string = interaction.options.getSubcommand()
	switch (subcommand) {
		case 'create': return await createItemHandler(interaction)
		case 'edit': return await editItemHandler(interaction)
		case 'list': return await listItemHandler(interaction)
		case 'remove': return await removeItemHandler(interaction)
		default: throw new Error(`Подкоманда "${subcommand}" не найдена`)
	}
}
