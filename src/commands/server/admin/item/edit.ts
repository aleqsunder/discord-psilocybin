import {SlashCommandSubcommandBuilder} from 'discord.js'
import {EffectMap, EffectType} from '../../../../factories/EffectFactory'

export const itemEdit: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
	.setName('edit')
	.setDescription('Редактирование предмета')
	.addNumberOption(option =>
		option
			.setName('item')
			.setDescription('Предмет')
			.setRequired(true)
			.setAutocomplete(true)
	)
	.addStringOption(option =>
		option
			.setName('name')
			.setDescription('Название предмета')
			.setMaxLength(50)
	)
	.addStringOption(option =>
		option
			.setName('description')
			.setDescription('Описание предмета')
			.setMaxLength(1000)
	)
	.addNumberOption(option =>
		option
			.setName('quality')
			.setDescription('Качество предмета')
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
