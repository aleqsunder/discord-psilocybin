import {SlashCommandSubcommandBuilder} from 'discord.js'

export const edit: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
	.setName('edit')
	.setDescription('[Администратор] Редактирование качества для предметов')
	.addStringOption(option =>
		option
			.setName('quality')
			.setDescription('Качество')
			.setRequired(true)
			.setAutocomplete(true)
	)
	.addStringOption(option =>
		option
			.setName('name')
			.setDescription('Название качества')
			.setMaxLength(50)
	)
	.addStringOption(option =>
		option
			.setName('color')
			.setDescription('Цвет (#rrggbb)')
			.setMinLength(7) // #rrggbb
			.setMaxLength(7)
	)
	.addNumberOption(option =>
		option
			.setName('chance')
			.setDescription('Шанс выпадения предмета с таким качеством из кейса')
			.setMinValue(0)
	)
