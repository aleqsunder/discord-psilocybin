import {ChatInputCommandInteraction} from 'discord.js'
import {ItemQuality} from '../../entities/psilocybin/ItemQuality'

export async function createItemQualityHandler(interaction: ChatInputCommandInteraction): Promise<void> {
	const name: string = interaction.options.getString('name', true)
	const color: string = interaction.options.getString('color', true)
	const sellCost: number = interaction.options.getNumber('sell-cost') ?? 100

	const itemQuality: ItemQuality = new ItemQuality()
	itemQuality.serverId = interaction.guildId ?? '0'
	itemQuality.name = name
	itemQuality.colorHex = color
	itemQuality.sellCost = sellCost

	await itemQuality.save()
	await interaction.reply(`Качество ${itemQuality.name} добавлено!`)
}
