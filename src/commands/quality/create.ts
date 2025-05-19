import {SlashCommandSubcommandBuilder} from 'discord.js'

export const create: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
	.setName('create')
	.setDescription('[Администратор] Создание нового качества для предметов')
	.addStringOption(option =>
		option
			.setName('name')
			.setDescription('Название качества')
			.setRequired(true)
			.setMaxLength(50)
	)
	.addStringOption(option =>
		option
			.setName('color')
			.setDescription('Цвет (#rrggbb)')
			.setRequired(true)
			.setMinLength(7) // #rrggbb
			.setMaxLength(7)
	)
	.addNumberOption(option =>
		option
			.setName('chance')
			.setDescription('Шанс выпадения предмета с таким качеством из кейса')
			.setRequired(true)
			.setMinValue(0)
	)
