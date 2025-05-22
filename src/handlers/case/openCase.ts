import {AttachmentBuilder, ChatInputCommandInteraction} from 'discord.js'
import {ItemGroup} from '../../entities/psilocybin/ItemGroup'
import ItemGroupRepository from '../../repositories/ItemGroupRepository'
import {Item} from '../../entities/psilocybin/Item'
import {drawEmoji, generateWeightedRandomItems} from '../../utils/inventoryUtils'
import {Canvas, createCanvas, Image, loadImage, SKRSContext2D} from '@napi-rs/canvas'
import {drawRoundedImage} from '../../utils/imageUtils'
import {
    ARROW_HEIGHT,
    ARROW_WIDTH,
    ARROW_Y_OFFSET,
    arrowShakeOffset, drawArrow,
    triggerArrowShake,
    updateArrowShake
} from '../../utils/arrowUtils'
import {Inventory} from '../../entities/psilocybin/Inventory'
import InventoryRepository from '../../repositories/InventoryRepository'
import {InventoryItem} from '../../entities/psilocybin/InventoryItem'
import fs from 'node:fs'

import {exec} from 'child_process'
import {promisify} from 'util'
import {join} from 'path'
import {writeFile} from 'fs/promises'
import {MuhomorUser} from '../../entities/MuhomorUser'
import MuhomorUserRepository from '../../repositories/MuhomorUserRepository'
import {truncateTextWithEllipsis} from '../../utils/paginationUtils'
import {formatMoney} from '../../utils/formatUtils'
const execAsync = promisify(exec)

const canvasWidth: number = 500
const canvasHeight: number = 180
const fps: number = 20
const durationDeceleration: number = 8
const speedAtMax = 100

const itemsCount: number = 30
const itemWidth: number = 150
const itemHeight: number = 150
const itemPadding: number = 20

interface ImageContainer {
    image: Image
    name: string
    description: string
    descriptionColor: string
    effectShortName?: string
}

async function animate(items: Item[]): Promise<Buffer> {
    const decelerationFrames: number = Math.round(durationDeceleration * fps)
    const images: ImageContainer[] = []
    for (const item of items) {
        images.push({
            image: await item.getImage(),
            name: item.name,
            description: item.quality?.name ?? '...',
            descriptionColor: item.quality?.colorHex ?? '#808080',
            effectShortName: item.getEffect()?.getShortName(),
        })
    }

    const canvas: Canvas = createCanvas(canvasWidth, canvasHeight)
    const ctx: SKRSContext2D = canvas.getContext('2d')

    const itemWidthContext: number = itemWidth - itemPadding * 2
    let currentScroll: number = images.length * itemWidth
        - canvasWidth / 2
        - itemWidth / 2
        + Math.floor(Math.random() * itemWidthContext - itemWidthContext / 2)

    const tempDir = join(__dirname, 'temp', `gif-animation-${Date.now()}`)
    await fs.promises.mkdir(tempDir, {recursive: true})
    const outputGifPath = join(tempDir, `output-${Date.now()}.gif`)

    for (let frame: number = decelerationFrames; frame > 0; frame--) {
        const t: number = (decelerationFrames - frame) / decelerationFrames
        const speed: number = Math.min(speedAtMax * t ** 3, speedAtMax)

        currentScroll -= speed
        const background: Image = await loadImage(join(__dirname, '../images/background.jpg'))
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

        const visibleStartIndex: number = Math.max(Math.floor(currentScroll / itemWidth) - 1, 0)
        const visibleEndIndex: number = visibleStartIndex + Math.ceil(canvasWidth / itemWidth) + 2

        for (let i: number = visibleStartIndex; i <= visibleEndIndex; i++) {
            const x: number = i * itemWidth - currentScroll
            if (x + itemWidth < 0 || x > canvasWidth) {
                continue
            }

            const index: number = i % images.length
            const {image, name, description, descriptionColor, effectShortName} = images[index]
            const imageX: number = x + itemPadding

            ctx.save()
            ctx.beginPath()

            ctx.fillStyle = "rgba(0, 0, 0, 0.40)"
            ctx.roundRect(imageX, itemPadding, itemWidthContext, itemHeight - 4, 10)
            ctx.fill()
            ctx.closePath()

            ctx.clip()
            ctx.restore()

            ctx.font = '100 13px "montserrat", serif'
            ctx.fillStyle = '#FFFFFF'

            const nameTruncated: string = truncateTextWithEllipsis(ctx, name ?? '', itemWidthContext - 18)
            ctx.fillText(nameTruncated, imageX + 6, itemHeight - 4)

            ctx.font = '100 10px "montserrat-medium", serif'
            ctx.fillStyle = descriptionColor

            const descriptionTruncated: string = truncateTextWithEllipsis(ctx, description ?? '', itemWidthContext - 18)
            ctx.fillText(descriptionTruncated, imageX + 6, itemHeight + 8)

            drawRoundedImage(
                ctx,
                image,
                imageX,
                itemPadding,
                itemWidth - itemPadding * 2,
                itemHeight - itemPadding * 2,
                10
            )

            if (effectShortName) {
                drawEmoji(
                    ctx,
                    effectShortName,
                    imageX + itemWidth - itemPadding * 2,
                    itemPadding + itemHeight - itemPadding * 2,
                    14,
                    4
                )
            }

            const centerX: number = canvasWidth / 2
            const itemCenterX: number = x + itemWidth / 2
            if (Math.abs(itemCenterX - centerX) < 100) {
                triggerArrowShake()
            }
        }

        updateArrowShake(Math.abs(speed))

        const arrowX: number = canvasWidth / 2 - ARROW_WIDTH / 2 + arrowShakeOffset
        const arrowY: number = canvasHeight - ARROW_HEIGHT - ARROW_Y_OFFSET
        drawArrow(ctx, arrowX, arrowY, ARROW_WIDTH, ARROW_HEIGHT)

        const buffer: Buffer<ArrayBufferLike> = canvas.toBuffer('image/jpeg')
        await writeFile(join(tempDir, `frame-${frame.toString().padStart(4, '0')}.jpeg`), buffer)
    }

    const ffmpegCommand = `ffmpeg \
        -framerate ${fps} \
        -i "${join(tempDir, 'frame-%04d.jpeg')}" \
        -vf "scale=${canvasWidth}:${canvasHeight}:flags=lanczos" \
        -c:v gif \
        -loop -1 \
        "${outputGifPath}"`

    try {
        await execAsync(ffmpegCommand)
    } catch (error) {
        // @ts-ignore
        console.error('Ошибка ffmpeg:', error.stderr || error.message)
        throw error
    }

    const gifBuffer: Buffer<ArrayBufferLike> = await fs.promises.readFile(outputGifPath)
    await cleanupTempFiles(tempDir, outputGifPath)

    return gifBuffer
}

async function cleanupTempFiles(tempDir: string, gifPath: string): Promise<void> {
    try {
        await fs.promises.unlink(gifPath)

        const files = await fs.promises.readdir(tempDir)
        for (const file of files) {
            await fs.promises.unlink(join(tempDir, file))
        }

        await fs.promises.rmdir(tempDir)
    } catch (e) {
        // @ts-ignore
        console.warn('Что-то пошло не так, да поебать в целом:', e.message)
    }
}

async function execute(index: number, interaction: ChatInputCommandInteraction, items: Item[]): Promise<void> {
    const randomItems: Item[] = generateWeightedRandomItems(items, itemsCount)

    const gifData: Buffer<ArrayBufferLike> = await animate(randomItems)
    const gifAttachment: AttachmentBuilder = new AttachmentBuilder(gifData, {
        name: 'slot-machine.gif',
        description: 'Анимация прокрутки'
    })

    const winnerItem: Item = randomItems[randomItems.length - 1]
    const userInventory: Inventory = await InventoryRepository.getCurrentInventory(interaction)

    const inventoryItem: InventoryItem = new InventoryItem()
    inventoryItem.item = winnerItem
    inventoryItem.inventory = userInventory
    await inventoryItem.save()

    const options = {
        files: [gifAttachment]
    }

    if (index === 0) {
        await interaction.editReply(options)
    } else {
        await interaction.followUp(options)
    }
}

async function executeOpenCaseHandler(caseEntity: ItemGroup, interaction: ChatInputCommandInteraction): Promise<void> {
    const user: MuhomorUser = await MuhomorUserRepository.getCurrentUser(interaction)
    const count: number = interaction.options.getNumber('count') ?? 1
    if (user.points < caseEntity.cost * count) {
        await interaction.editReply(`У вас нет денег ДАЖЕ на кейс :index_pointing_at_the_viewer::joy:`)
        return
    }

    try {
        user.points = formatMoney(user.points - caseEntity.cost * count)
        await user.save()

        const items: Item[] = caseEntity.items
        for (let index: number = 0; index < count; index++) {
            await execute(index, interaction, items)
        }
    } catch (error) {
        console.error('Ошибка:', error)
        await interaction.editReply('Что-то пошло не так!')
    }
}

export async function openCaseHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const caseId: number = interaction.options.getNumber('case', true)
    const caseEntity: ItemGroup|null = await ItemGroupRepository.findOne({
        where: {
            id: caseId,
            serverId: interaction.guildId!
        },
        relations: ['items', 'items.quality']
    })

    if (!caseEntity) {
        await interaction.editReply(`Кейс не найден`)
        return
    }

    await executeOpenCaseHandler(caseEntity, interaction)
}

export async function openRandomCaseHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()
    const caseEntity: ItemGroup|null = await ItemGroupRepository.getOneByRandom({
        serverId: interaction.guildId!
    })

    if (!caseEntity) {
        await interaction.editReply(`Кейс не найден`)
        return
    }

    await executeOpenCaseHandler(caseEntity, interaction)
}
