import {ChatInputCommandInteraction} from 'discord.js'
import {createItemQualityHandler} from './createItemQuality'
import {editItemQualityHandler} from './editItemQuality'
import {isAdmin} from '../../utils/permissionUtils'

export async function itemQualityHandler(interaction: ChatInputCommandInteraction): Promise<void> {
	if (!isAdmin(interaction)) {
		await interaction.reply(`У вас недостаточно прав для выполнения данной команды`)
		return
	}

	const subcommand: string = interaction.options.getSubcommand()
	switch (subcommand) {
		case 'create': return await createItemQualityHandler(interaction)
		case 'edit': return await editItemQualityHandler(interaction)
		default: throw new Error(`Подкоманда "${subcommand}" не найдена`)
	}
}
