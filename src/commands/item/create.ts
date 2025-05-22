import {SlashCommandSubcommandBuilder} from 'discord.js'
import {EffectMap, EffectType} from '../../factories/EffectFactory'

export const create: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
	.setName('create')
	.setDescription('[Администратор] Создание нового предмета')
	.addStringOption(option =>
		option
			.setName('name')
			.setDescription('Название предмета')
			.setRequired(true)
			.setMaxLength(50)
	)
	.addStringOption(option =>
		option
			.setName('description')
			.setDescription('Описание предмета')
			.setRequired(true)
			.setMaxLength(1000)
	)
	.addNumberOption(option =>
		option
			.setName('quality')
			.setDescription('Качество предмета')
			.setRequired(true)
			.setAutocomplete(true)
	)
	.addNumberOption(option =>
		option
			.setName('case')
			.setDescription('Кейс предмета')
			.setAutocomplete(true)
	)
	.addAttachmentOption(option =>
		option
			.setName('image')
			.setDescription('Картинка предмета')
	)
	.addStringOption(option =>
		option
			.setName('effect')
			.setDescription('Эффект предмета')
			.addChoices(
				...Object.values(EffectType).map(type => ({
					name: EffectMap[type].name,
					value: type,
				}))
			)
	)
