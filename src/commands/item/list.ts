import {SlashCommandSubcommandBuilder} from 'discord.js'

export const list: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
	.setName('list')
	.setDescription('Показать список предметов')
	.addNumberOption(option =>
		option
			.setName('page')
			.setDescription('Страница')
	)
