import {Item} from '../entities/psilocybin/Item'
import {Canvas, createCanvas, loadImage, SKRSContext2D} from '@napi-rs/canvas'
import {AttachmentBuilder} from 'discord.js'
import {truncateTextWithEllipsis} from './paginationUtils'
import {ItemGroup} from '../entities/psilocybin/ItemGroup'
import {ItemQuality} from '../entities/psilocybin/ItemQuality'

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

		const nameY: number = y + fullConfig.imageSize + 10
		context.font = `${nameHeight}px serif`
		context.fillStyle = "#FFFFFF"

		const nameTruncated = truncateTextWithEllipsis(context, item.name, sizeWithoutPadding)
		context.fillText(nameTruncated, x, nameY)

		const descriptionY: number = nameY + nameHeight
		context.font = `${qualityHeight}px serif`
		context.fillStyle = item.descriptionColor ?? '#808080'

		const qualityNameTruncated = truncateTextWithEllipsis(context, item.description ?? '', sizeWithoutPadding)
		context.fillText(qualityNameTruncated, x, descriptionY)
	}

	return new AttachmentBuilder(await canvas.encode('png'), {name: 'background.png'})
}

export async function listItemsToAttachment(items: Item[], config?: ListImageConfig): Promise<AttachmentBuilder> {
	const list: ListItemConfig[] = []

	for (const item of items) {
		list.push({
			imagePath: item.imagePath,
			name: item.name,
			description: item.quality?.name ?? '...',
			descriptionColor: item.quality?.colorHex ?? '#808080',
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
