import {ItemQuality} from '../../entities/psilocybin/ItemQuality'
import {ItemGroup} from '../../entities/psilocybin/ItemGroup'
import {Attachment, ChatInputCommandInteraction} from 'discord.js'
import {Item} from '../../entities/psilocybin/Item'
import {DEFAULT_ITEM_IMAGE_PATH, DEFAULT_ITEMS_CATALOG} from '../../constants'
import {saveImageToStorage} from '../../utils/imageUtils'
import ItemQualityRepository from '../../repositories/ItemQualityRepository'
import ItemGroupRepository from '../../repositories/ItemGroupRepository'
import {isAdmin} from '../../utils/permissionUtils'
import {EffectType} from '../../factories/EffectFactory'
import {generateInfoAttachment} from '../../utils/inventoryUtils'

export async function createItemHandler(interaction: ChatInputCommandInteraction): Promise<void> {
	if (!isAdmin(interaction)) {
		await interaction.editReply(`У вас недостаточно прав для выполнения данной команды`)
		return
	}

	const name: string = interaction.options.getString('name', true)
	const description: string = interaction.options.getString('description', true)
	const qualityId: number|null = interaction.options.getNumber('quality')
	const caseId: number|null = interaction.options.getNumber('case')
	const image: Attachment|null = interaction.options.getAttachment('image')
	const effectType = interaction.options.getString('effect') as EffectType

	const item = new Item()
	item.serverId = interaction.guildId!
	item.name = name
	item.description = description

	if (qualityId) {
		const itemQuality: ItemQuality | null = await ItemQualityRepository.findOneBy({
			id: qualityId,
			serverId: interaction.guildId!,
		})

		if (!itemQuality) {
			await interaction.editReply(`Качество не существует`)
			return
		}

		item.quality = itemQuality
	}

	if (caseId) {
		const itemGroup: ItemGroup|null = await ItemGroupRepository.findOneBy({
			id: caseId,
			serverId: interaction.guildId!,
		})

		if (!itemGroup) {
			await interaction.editReply(`Кейса не существует`)
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
	await generateInfoAttachment(item, interaction)
}
