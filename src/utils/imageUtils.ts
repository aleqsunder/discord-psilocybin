import {Attachment} from 'discord.js'
import fs from 'node:fs'
import path from 'path'
import sharp from 'sharp'
import {Image, SKRSContext2D} from '@napi-rs/canvas'
import {DEFAULT_IMAGES_CATALOG} from '../constants'

export async function saveImageToStorage(id: number, image: Attachment, pathToSave: string): Promise<string> {
	const timestamp: number = Date.now()

	const response = await fetch(image.url)
	const buffer: ArrayBuffer = await response.arrayBuffer()
	const imagePath: string = `${pathToSave}/${id}_${timestamp}.png`

	if (!fs.existsSync(path.dirname(pathToSave))) {
		fs.mkdirSync(path.dirname(pathToSave), {recursive: true})
	}

	await sharp(buffer)
		.resize(300, 300, {fit: 'cover'})
		.toFormat('png')
		.toFile(imagePath)

	return imagePath
}

// В базе лежат абсолютные пути, поэтому после переноса проекта в другой каталог они перестают существовать.
// Такой путь переносим в текущий каталог images, а если файла нет и там — отдаём картинку по умолчанию.
export function resolveImagePath(imagePath: string, fallbackPath: string): string {
	if (imagePath && fs.existsSync(imagePath)) {
		return imagePath
	}

	const normalized: string = (imagePath ?? '').replace(/\\/g, '/')
	const index: number = normalized.lastIndexOf('/images/')
	if (index !== -1) {
		const rebased: string = DEFAULT_IMAGES_CATALOG + normalized.slice(index + '/images'.length)
		if (fs.existsSync(rebased)) {
			return rebased
		}
	}

	return fallbackPath
}

export function drawRoundedImage(
	ctx: SKRSContext2D,
	image: Image,
	x: number, y: number,
	width: number, height: number,
	radius: number
): void {
	ctx.save()

	ctx.beginPath()
	ctx.roundRect(x, y, width, height, radius)
	ctx.closePath()
	ctx.clip()

	ctx.drawImage(image, x, y, width, height)

	ctx.restore()
}
