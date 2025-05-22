import {ItemQuality} from '../../entities/psilocybin/ItemQuality'
import {Attachment, ChatInputCommandInteraction} from 'discord.js'
import {DEFAULT_ITEMS_CATALOG} from '../../constants'
import {saveImageToStorage} from '../../utils/imageUtils'
import ItemRepository from '../../repositories/ItemRepository'
import {Item} from '../../entities/psilocybin/Item'
import {ItemGroup} from '../../entities/psilocybin/ItemGroup'
import ItemGroupRepository from '../../repositories/ItemGroupRepository'
import {isAdmin} from '../../utils/permissionUtils'
import {EffectType} from '../../factories/EffectFactory'
import {generateInfoAttachment} from '../../utils/inventoryUtils'

export async function editItemHandler(interaction: ChatInputCommandInteraction): Promise<void> {
	if (!isAdmin(interaction)) {
		await interaction.editReply(`У вас недостаточно прав для выполнения данной команды`)
		return
	}

	const itemId: number = interaction.options.getNumber('item', true)
	const item: Item|null = await ItemRepository.findOne({
		where: {
			id: itemId,
			serverId: interaction.guildId!,
		},
		relations: ['quality', 'group']
	})

	if (!item) {
		await interaction.editReply(`Предмет не существует`)
		return
	}

	const caseId: number|null = interaction.options.getNumber('case')
	if (caseId) {
		const caseEntity: ItemGroup|null = await ItemGroupRepository.findOneBy({
			id: caseId,
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
	const qualityId: number|null = interaction.options.getNumber('quality')
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
			id: qualityId,
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
	await generateInfoAttachment(item, interaction)
}
