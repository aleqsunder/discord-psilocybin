import {SlashCommandBuilder} from 'discord.js'
import {create} from './create'
import {edit} from './edit'
import {remove} from './remove'

export const quality = new SlashCommandBuilder()
	.setName('quality')
	.setDescription('Команды для взаимодействия с качеством для предметов')
	.addSubcommand(create)
	.addSubcommand(edit)
	.addSubcommand(remove)
	.toJSON()
