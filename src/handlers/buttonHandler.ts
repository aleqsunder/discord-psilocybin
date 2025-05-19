import {ButtonInteraction} from 'discord.js'
import {itemPaginationHandler} from './item/button'
import {inventoryPaginationHandler} from './user/inventory/button'
import {casePaginationHandler} from './case/button'
import {musicControlHandler} from './music/button'

export async function buttonHandler(interaction: ButtonInteraction): Promise<void> {
	const [command, subcommand, option] = interaction.customId.split(':')

	switch (command) {
		case 'item': return await itemPaginationHandler(interaction, subcommand, option)
		case 'inventory': return await inventoryPaginationHandler(interaction, subcommand, option)
		case 'case': return await casePaginationHandler(interaction, subcommand, option)

		// Музыкальные кейсы
		case 'pause':
		case 'resume':
		case 'skip':
		case 'stop':
			return await musicControlHandler(interaction, command)

		default: throw new Error(`Несуществующая команда ${command} (button)`)
	}
}
