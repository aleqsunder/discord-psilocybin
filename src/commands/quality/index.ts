import {SlashCommandBuilder} from 'discord.js'
import {create} from './create'
import {edit} from './edit'

export const quality = new SlashCommandBuilder()
	.setName('quality')
	.setDescription('Команды для взаимодействия с качеством для предметов')
	.addSubcommand(create)
	.addSubcommand(edit)
	.toJSON()
