import {SlashCommandBuilder} from 'discord.js'
import {create} from './create'
import {edit} from './edit'
import {list} from './list'
import {open} from './open'
import {show} from './show'
import {remove} from './remove'

export const caseCommand = new SlashCommandBuilder()
	.setName('case')
	.setDescription('Команды для взаимодействия с кейсами')
	.addSubcommand(create)
	.addSubcommand(edit)
	.addSubcommand(list)
	.addSubcommand(open)
	.addSubcommand(show)
	.addSubcommand(remove)
	.toJSON()
