import {ChatInputCommandInteraction} from 'discord.js'
import {createItemHandler} from './createItem'
import {editItemHandler} from './editItem'
import {listItemHandler} from './list'

export async function itemHandler(interaction: ChatInputCommandInteraction): Promise<void> {
	const subcommand: string = interaction.options.getSubcommand()
	switch (subcommand) {
		case 'create': return await createItemHandler(interaction)
		case 'edit': return await editItemHandler(interaction)
		case 'list': return await listItemHandler(interaction)
		default: throw new Error(`Подкоманда "${subcommand}" не найдена`)
	}
}
