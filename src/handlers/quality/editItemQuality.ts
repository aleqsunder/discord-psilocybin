import {ChatInputCommandInteraction} from 'discord.js'
import {ItemQuality} from '../../entities/psilocybin/ItemQuality'
import ItemQualityRepository from '../../repositories/ItemQualityRepository'

export async function editItemQualityHandler(interaction: ChatInputCommandInteraction): Promise<void> {
	const qualityId: string|null = interaction.options.getString('quality')
	const name: string|null = interaction.options.getString('name')
	const color: string|null = interaction.options.getString('color')
	const sellCost: number|null = interaction.options.getInteger('sell-cost')

	const itemQuality: ItemQuality|null = await ItemQualityRepository.findOneBy({id: Number(qualityId)})
	if (!itemQuality) {
		await interaction.reply(`Качество не существует`)
		return
	}

	if (name) {
		itemQuality.name = name
	}

	if (color) {
		itemQuality.colorHex = color
	}

	if (sellCost) {
		itemQuality.sellCost = sellCost
	}

	await itemQuality.save()
	await interaction.reply(`Качество ${itemQuality.name} отредактировано!`)
}
