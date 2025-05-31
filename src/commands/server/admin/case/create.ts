import {SlashCommandSubcommandBuilder} from 'discord.js'

export const caseCreate: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
	.setName('create')
	.setDescription('Создание нового кейса')
	.addStringOption(option =>
		option
			.setName('name')
			.setDescription('Название кейса')
			.setRequired(true)
			.setMaxLength(50)
	)
	.addStringOption(option =>
		option
			.setName('description')
			.setDescription('Описание кейса')
			.setRequired(true)
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
