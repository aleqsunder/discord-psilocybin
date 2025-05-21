import {ChatInputCommandInteraction} from 'discord.js'
import {createCaseHandler} from './createCase'
import {editCaseHandler} from './editCase'
import {listCaseHandler} from './list'
import {showCaseHandler} from './showCase'
import {openCaseHandler} from './openCase'
import {removeCaseHandler} from './remove'

export async function itemCaseHandler(interaction: ChatInputCommandInteraction): Promise<void> {
	const subcommand: string = interaction.options.getSubcommand()
	switch (subcommand) {
		case 'create': return await createCaseHandler(interaction)
		case 'edit': return await editCaseHandler(interaction)
		case 'list': return await listCaseHandler(interaction)
		case 'open': return await openCaseHandler(interaction)
		case 'show': return await showCaseHandler(interaction)
		case 'remove': return await removeCaseHandler(interaction)
		default: throw new Error(`Подкоманда "${subcommand}" не найдена`)
	}
}
