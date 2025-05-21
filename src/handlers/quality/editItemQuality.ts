import {ChatInputCommandInteraction} from 'discord.js'
import {ItemQuality} from '../../entities/psilocybin/ItemQuality'
import ItemQualityRepository from '../../repositories/ItemQualityRepository'

export async function editItemQualityHandler(interaction: ChatInputCommandInteraction): Promise<void> {
	const qualityId: string|null = interaction.options.getString('quality')
	const name: string|null = interaction.options.getString('name')
	const color: string|null = interaction.options.getString('color')
	const chance: number|null = interaction.options.getNumber('chance')
	const sellCost: number|null = interaction.options.getNumber('sell-cost')

	const itemQuality: ItemQuality|null = await ItemQualityRepository.findOneBy({
		id: Number(qualityId),
		serverId: interaction.guildId!,
	})

	if (!itemQuality) {
		await interaction.editReply(`Качество не существует`)
		return
	}

	if (name) {
		itemQuality.name = name
	}

	if (color) {
		itemQuality.colorHex = color
	}

	if (chance) {
		itemQuality.chance = chance
	}

	if (sellCost) {
		itemQuality.sellCost = sellCost
	}

	await itemQuality.save()
	await interaction.editReply(`Качество ${itemQuality.name} отредактировано!`)
}
