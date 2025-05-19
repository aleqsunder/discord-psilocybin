import {SlashCommandBuilder} from 'discord.js'

export const help = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Показывает список всех доступных команд')
	.addStringOption(option =>
		option
			.setName('command')
			.setDescription('Команда из списка')
			.setAutocomplete(true)
	)
    .toJSON()
