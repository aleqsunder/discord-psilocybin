import {Item} from '../entities/psilocybin/Item'
import {Canvas, createCanvas, loadImage, SKRSContext2D} from '@napi-rs/canvas'
import {AttachmentBuilder, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder} from 'discord.js'
import {truncateTextWithEllipsis} from './paginationUtils'
import {ItemGroup} from '../entities/psilocybin/ItemGroup'
import {ItemQuality} from '../entities/psilocybin/ItemQuality'
import path from 'path'

export const defaultListImageConfig: RequiredListImageConfig = {
	rows: 2,
	itemsInRow: 4,
	padding: 20,
	radius: 16,
	imageSize: 200
}

export interface ListItemConfig {
	imagePath: string
	name: string
	description?: string
	descriptionColor?: string
	effectShortName?: string
}

export async function generateList(items: ListItemConfig[], config?: ListImageConfig) {
	const fullConfig: RequiredListImageConfig = {
		...defaultListImageConfig,
		...config,
	}

	const nameHeight: number = fullConfig.imageSize / 9
	const qualityHeight: number = fullConfig.imageSize / 11

	const cardRowWidth: number = fullConfig.imageSize
	const cardRowHeight: number = fullConfig.imageSize + fullConfig.padding + nameHeight + qualityHeight
	const sizeWithoutPadding = fullConfig.imageSize - fullConfig.padding
	const rows: number = Math.ceil(items.length / fullConfig.itemsInRow)

	const canvasWidth: number = cardRowWidth * fullConfig.itemsInRow
	const canvasHeight: number = cardRowHeight * rows

	const canvas: Canvas = createCanvas(canvasWidth, canvasHeight)
	const context: SKRSContext2D = canvas.getContext('2d')

	for (const index in items) {
		const item: ListItemConfig = items[index]
		const image = await loadImage(item.imagePath)

		const x: number = (Number(index) % fullConfig.itemsInRow) * cardRowWidth
		const y: number = (Number(index) / fullConfig.itemsInRow ^ 0) * cardRowHeight

		context.beginPath()
		context.moveTo(x + fullConfig.radius, y)
		context.arcTo(x + sizeWithoutPadding, y, x + sizeWithoutPadding, y + sizeWithoutPadding, fullConfig.radius)
		context.arcTo(x + sizeWithoutPadding, y + sizeWithoutPadding, x, y + sizeWithoutPadding, fullConfig.radius)
		context.arcTo(x, y + sizeWithoutPadding, x, y, fullConfig.radius)
		context.arcTo(x, y, x + sizeWithoutPadding, y, fullConfig.radius)
		context.closePath()

		context.save()
		context.clip()

		context.drawImage(image, x, y, sizeWithoutPadding, sizeWithoutPadding)
		context.restore()

		if (item.effectShortName) {
			drawEmoji(context, item.effectShortName, x + sizeWithoutPadding, y + sizeWithoutPadding)
		}

		const nameY: number = y + fullConfig.imageSize + 10
		context.font = `${nameHeight}px "montserrat-medium", serif`
		context.fillStyle = "#FFFFFF"

		const nameTruncated = truncateTextWithEllipsis(context, item.name, sizeWithoutPadding)
		context.fillText(nameTruncated, x, nameY)

		const descriptionY: number = nameY + nameHeight
		context.font = `${qualityHeight}px "montserrat-medium", serif`
		context.fillStyle = item.descriptionColor ?? '#808080'

		const qualityNameTruncated = truncateTextWithEllipsis(context, item.description ?? '', sizeWithoutPadding)
		context.fillText(qualityNameTruncated, x, descriptionY)
	}

	return new AttachmentBuilder(await canvas.encode('png'), {name: 'background.png'})
}

export function drawEmoji(
	context: SKRSContext2D,
	text: string, x: number, y: number,
	fontSize: number = 26,
	emojiPadding: number = 10
) {
	context.save()

	context.font = `${fontSize}px "emojis", sans-serif`
	context.textAlign = 'end'
	context.textBaseline = 'bottom'

	const textWidth: number = context.measureText(text).width
	const textHeight: number = fontSize

	const backgroundWidth: number = textWidth + emojiPadding * 2
	const backgroundHeight: number = textHeight + emojiPadding * 2

	drawRoundedRect(context, x - backgroundWidth, y - backgroundHeight, backgroundWidth, backgroundHeight, emojiPadding)

	context.fillStyle = 'rgba(0, 0, 0, 0.8)'
	context.fill()

	context.fillStyle = 'black'
	context.fillText(text, x - emojiPadding, y - emojiPadding / 2)
	context.restore()
}

function drawRoundedRect(ctx: SKRSContext2D, x: number, y: number, width: number, height: number, radius: number) {
	ctx.beginPath()
	ctx.moveTo(x + radius, y)
	ctx.lineTo(x + width - radius, y)
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
	ctx.lineTo(x + width, y + height - radius)
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
	ctx.lineTo(x + radius, y + height)
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
	ctx.lineTo(x, y + radius)
	ctx.quadraticCurveTo(x, y, x + radius, y)
	ctx.closePath()
}

export async function listItemsToAttachment(items: Item[], config?: ListImageConfig): Promise<AttachmentBuilder> {
	const list: ListItemConfig[] = []

	for (const item of items) {
		list.push({
			imagePath: item.imagePath,
			name: item.name,
			description: item.quality?.name ?? '...',
			descriptionColor: item.quality?.colorHex ?? '#808080',
			effectShortName: item.getEffect()?.getShortName()
		})
	}

	return generateList(list, config)
}

export async function listCasesToAttachment(items: ItemGroup[], config?: ListImageConfig): Promise<AttachmentBuilder> {
	const list: ListItemConfig[] = []

	for (const item of items) {
		list.push({
			imagePath: item.imagePath,
			name: item.name,
			description: item.description,
		})
	}

	return generateList(list, config)
}

type QualityGroup = {
	quality: ItemQuality
	items: Item[]
}

export function generateWeightedRandomItems(items: Item[], size: number): Item[] {
	if (items.length === 0 || size <= 0) {
		return []
	}

	const uniqueQualities: Record<number, QualityGroup> = {}
	for (const item of items) {
		const quality: ItemQuality|null = item.quality
		if (!quality) {
			continue
		}

		if (!uniqueQualities[quality.id]) {
			uniqueQualities[quality.id] = {quality, items: []}
		}

		uniqueQualities[quality.id].items.push(item)
	}

	const qualityGroups: QualityGroup[] = Object.values(uniqueQualities)
	const totalChance: number = qualityGroups.reduce((sum: number, group: QualityGroup) => sum + group.quality.chance, 0)
	const result: Item[] = []
	for (let i: number = 0; i < size; i++) {
		let currentSum: number = 0
		const random: number = Math.random() * totalChance

		for (const group of qualityGroups) {
			currentSum += group.quality.chance
			if (currentSum < random) {
				continue
			}

			const itemsInQuality: Item[] = group.items
			result.push(itemsInQuality[Math.floor(Math.random() * itemsInQuality.length)])
			break
		}
	}

	return result
}

export async function generateInfoAttachment(item: Item, interaction: ChatInputCommandInteraction) {
	const fields = []

	if (item.quality) {
		fields.push({name: 'Качество', value: item.quality?.name ?? ''})
	}

	if (item.group) {
		fields.push({name: 'Кейс', value: item.group?.name ?? ''})
	}

	if (item.getEffect()) {
		fields.push({name: 'Эффект', value: item.getEffect()?.getName() ?? ''})
	}

	const attachment = new AttachmentBuilder(item.imagePath, {name: path.basename(item.imagePath)})
	const embed: EmbedBuilder = new EmbedBuilder()
		.setTitle(`Предмет "${item.name}" (id: ${item.id})`)
		.setDescription(item.description)
		.addFields(fields)
		.setImage(`attachment://${path.basename(item.imagePath)}`)
		.setColor(item.quality?.colorHex as ColorResolvable ?? 0x333)

	await interaction.editReply({embeds: [embed], files: [attachment]})
}
