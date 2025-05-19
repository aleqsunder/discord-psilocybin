import {SlashCommandSubcommandBuilder} from 'discord.js'

export const open: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
	.setName('open')
	.setDescription('Открытие кейса')
	.addStringOption(option =>
		option
			.setName('case')
			.setDescription('Кейс')
			.setRequired(true)
			.setAutocomplete(true)
	)
