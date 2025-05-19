import {Attachment} from 'discord.js'
import fs from 'node:fs'
import path from 'path'
import sharp from 'sharp'
import {Image, SKRSContext2D} from '@napi-rs/canvas'

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
