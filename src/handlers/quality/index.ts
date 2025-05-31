import {ChatInputCommandInteraction} from 'discord.js'
import {createItemQualityHandler} from './createItemQuality'
import {editItemQualityHandler} from './editItemQuality'
import {removeItemQualityHandler} from './removeItemQuality'

export async function itemQualityAdminHandler(interaction: ChatInputCommandInteraction): Promise<void> {
	const subcommand: string = interaction.options.getSubcommand()
	switch (subcommand) {
		case 'create': return await createItemQualityHandler(interaction)
		case 'edit': return await editItemQualityHandler(interaction)
		case 'remove': return await removeItemQualityHandler(interaction)
		default: throw new Error(`Подкоманда "${subcommand}" не найдена`)
	}
}
