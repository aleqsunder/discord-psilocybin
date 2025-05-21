import path from 'path'
import {ItemQuality} from '../../entities/psilocybin/ItemQuality'
import {Attachment, AttachmentBuilder, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder} from 'discord.js'
import {DEFAULT_ITEMS_CATALOG} from '../../constants'
import {saveImageToStorage} from '../../utils/imageUtils'
import ItemRepository from '../../repositories/ItemRepository'
import {Item} from '../../entities/psilocybin/Item'
import {ItemGroup} from '../../entities/psilocybin/ItemGroup'
import ItemGroupRepository from '../../repositories/ItemGroupRepository'
import {isAdmin} from '../../utils/permissionUtils'
import {EffectType} from '../../factories/EffectFactory'

export async function editItemHandler(interaction: ChatInputCommandInteraction): Promise<void> {
	if (!isAdmin(interaction)) {
		await interaction.editReply(`У вас недостаточно прав для выполнения данной команды`)
		return
	}

	const itemId: string = interaction.options.getString('item', true)
	const item: Item|null = await ItemRepository.findOneBy({
		id: Number(itemId),
		serverId: interaction.guildId!,
	})

	if (!item) {
		await interaction.editReply(`Предмет не существует`)
		return
	}

	const caseId: string|null = interaction.options.getString('case')
	if (caseId) {
		const caseEntity: ItemGroup | null = await ItemGroupRepository.findOneBy({
			id: Number(caseId),
			serverId: interaction.guildId!,
		})

		if (!caseEntity) {
			await interaction.editReply(`Кейса не существует`)
			return
		}

		item.group = caseEntity
	}

	const name: string|null = interaction.options.getString('name')
	const description: string|null = interaction.options.getString('description')
	const qualityId: string|null = interaction.options.getString('quality')
	const image: Attachment|null = interaction.options.getAttachment('image')
	const effectType: EffectType|null = interaction.options.getString('effect') as EffectType ?? null

	if (name) {
		item.name = name
	}

	if (description) {
		item.description = description
	}

	if (qualityId) {
		const itemQuality: ItemQuality|null = await ItemQuality.findOneBy({
			id: Number(qualityId),
			serverId: interaction.guildId!,
		})

		if (!itemQuality) {
			await interaction.editReply(`Качество не существует`)
			return
		}

		item.quality = itemQuality
	}

	if (image) {
		item.imagePath = await saveImageToStorage(item.id, image, DEFAULT_ITEMS_CATALOG)
	}

	if (effectType && effectType in EffectType) {
		item.effect = effectType
	}

	await item.save()

	const attachment = new AttachmentBuilder(item.imagePath, {name: path.basename(item.imagePath)})
	const embed: EmbedBuilder = new EmbedBuilder()
		.setTitle(`Предмет "${item.name}" (id: ${item.id}) отредактирован!`)
		.setDescription(item.description)
		.addFields({name: 'Качество', value: item.quality?.name ?? ''})
		.setImage(`attachment://${path.basename(item.imagePath)}`)
		.setColor(item.quality?.colorHex as ColorResolvable ?? 0x333)

	await interaction.editReply({embeds: [embed], files: [attachment]})
}
