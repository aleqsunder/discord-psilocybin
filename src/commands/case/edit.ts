import {SlashCommandSubcommandBuilder} from 'discord.js'

export const edit: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
	.setName('edit')
	.setDescription('[Администратор] Редактирование кейса')
	.addNumberOption(option =>
		option
			.setName('case')
			.setDescription('Кейс')
			.setRequired(true)
			.setAutocomplete(true)
	)
	.addStringOption(option =>
		option
			.setName('name')
			.setDescription('Название кейса')
			.setMaxLength(50)
	)
	.addStringOption(option =>
		option
			.setName('description')
			.setDescription('Описание кейса')
			.setMaxLength(1000)
	)
	.addAttachmentOption(option =>
		option
			.setName('image')
			.setDescription('Картинка кейса')
	)
	.addNumberOption(option =>
		option
			.setName('cost')
			.setDescription('Стоимость кейса')
			.setMinValue(0)
	)
