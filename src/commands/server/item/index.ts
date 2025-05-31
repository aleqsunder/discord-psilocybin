import {SlashCommandBuilder} from 'discord.js'
import {list} from './list'
import {info} from './info'

export const item = new SlashCommandBuilder()
	.setName('item')
	.setDescription('Команды для взаимодействия с предметами')
	.addSubcommand(list)
	.addSubcommand(info)
