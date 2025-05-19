import {SlashCommandBuilder} from 'discord.js'
import {create} from './create'
import {edit} from './edit'
import {list} from './list'

export const item = new SlashCommandBuilder()
	.setName('item')
	.setDescription('Команды для взаимодействия с предметами')
	.addSubcommand(create)
	.addSubcommand(edit)
	.addSubcommand(list)
	.toJSON()
