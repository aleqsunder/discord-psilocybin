import {SlashCommandSubcommandBuilder} from 'discord.js'

export const open: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
	.setName('open')
	.setDescription('Открытие кейса')
	.addNumberOption(option =>
		option
			.setName('case')
			.setDescription('Кейс')
			.setRequired(true)
			.setAutocomplete(true)
	)
	.addNumberOption(option =>
		option
			.setName('count')
			.setDescription('Количество кейсов за раз')
			.setMinValue(1)
			.setMaxValue(10)
	)
