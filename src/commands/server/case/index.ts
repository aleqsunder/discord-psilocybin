import {SlashCommandBuilder} from 'discord.js'
import {list} from './list'
import {open} from './open'
import {show} from './show'

export const caseCommand = new SlashCommandBuilder()
	.setName('case')
	.setDescription('Команды для взаимодействия с кейсами')
	.addSubcommand(list)
	.addSubcommand(open)
	.addSubcommand(show)
