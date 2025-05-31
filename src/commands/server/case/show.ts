import {SlashCommandSubcommandBuilder} from 'discord.js'

export const show: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
	.setName('show')
	.setDescription('Показать содержимое кейса')
	.addNumberOption(option =>
		option
			.setName('case')
			.setDescription('Кейс')
			.setRequired(true)
			.setAutocomplete(true)
	)
