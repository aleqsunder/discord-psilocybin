import path from 'path'
import {ItemQuality} from '../../entities/psilocybin/ItemQuality'
import {ItemGroup} from '../../entities/psilocybin/ItemGroup'
import {Attachment, AttachmentBuilder, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder} from 'discord.js'
import {Item} from '../../entities/psilocybin/Item'
import {DEFAULT_ITEM_IMAGE_PATH, DEFAULT_ITEMS_CATALOG} from '../../constants'
import {saveImageToStorage} from '../../utils/imageUtils'
import ItemQualityRepository from '../../repositories/ItemQualityRepository'
import ItemGroupRepository from '../../repositories/ItemGroupRepository'
import {isAdmin} from '../../utils/permissionUtils'
import {EffectType} from '../../factories/EffectFactory'

export async function createItemHandler(interaction: ChatInputCommandInteraction): Promise<void> {
	if (!isAdmin(interaction)) {
		await interaction.reply(`У вас недостаточно прав для выполнения данной команды`)
		return
	}

	const name: string = interaction.options.getString('name', true)
	const description: string = interaction.options.getString('description', true)
	const qualityId: string|null = interaction.options.getString('quality')
	const caseId: string|null = interaction.options.getString('case')
	const groupId: string|null = interaction.options.getString('group')
	const image: Attachment|null = interaction.options.getAttachment('image')
	const effectType = interaction.options.getString('effect') as EffectType

	const item = new Item()
	item.serverId = interaction.guildId!
	item.name = name
	item.description = description

	if (qualityId) {
		const itemQuality: ItemQuality | null = await ItemQualityRepository.findOneBy({
			id: Number(qualityId),
			serverId: interaction.guildId!,
		})

		if (!itemQuality) {
			await interaction.reply(`Качество не существует`)
			return
		}

		item.quality = itemQuality
	}

	if (caseId) {
		const itemGroup: ItemGroup|null = await ItemGroupRepository.findOneBy({
			id: Number(caseId),
			serverId: interaction.guildId!,
		})

		if (!itemGroup) {
			await interaction.reply(`Кейса не существует`)
			return
		}

		item.group = itemGroup
	}

	if (groupId) {
		const itemGroup: ItemGroup | null = await ItemGroupRepository.findOneBy({
			id: Number(groupId),
			serverId: interaction.guildId!,
		})

		if (!itemGroup) {
			await interaction.reply(`Группа не существует`)
			return
		}

		item.group = itemGroup
	}

	if (effectType && effectType in EffectType) {
		item.effect = effectType
	}

	await item.save()

	let imagePath: string = DEFAULT_ITEM_IMAGE_PATH
	if (image) {
		imagePath = await saveImageToStorage(item.id, image, DEFAULT_ITEMS_CATALOG)
	}

	item.imagePath = imagePath
	await item.save()

	const attachment = new AttachmentBuilder(imagePath, {name: path.basename(imagePath)})
	const embed = new EmbedBuilder()
		.setTitle(`Предмет "${item.name}" (id: ${item.id}) создан!`)
		.setDescription(item.description)
		.addFields(
			{name: 'Качество', value: item.quality?.name ?? 'Отсутствует'},
		)
		.setImage(`attachment://${path.basename(imagePath)}`)
		.setColor((item.quality?.colorHex ?? '#808080') as ColorResolvable)

	await interaction.reply({embeds: [embed], files: [attachment]})
}
