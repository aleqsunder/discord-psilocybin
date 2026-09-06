import {AttachmentBuilder, ChatInputCommandInteraction, GuildTextBasedChannel, Message} from 'discord.js'
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
import {MuhomorUser} from '../../entities/MuhomorUser'
import MuhomorUserRepository from '../../repositories/MuhomorUserRepository'
import {truncateTextWithEllipsis} from '../../utils/paginationUtils'
import {formatMoney} from '../../utils/formatUtils'
import {renderGif} from '../../services/GifService'
import {DEFAULT_IMAGES_CATALOG} from '../../constants'

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

interface AnimationResult {
    gifBuffer: Buffer
    winBuffer: Buffer
}

async function animate(items: Item[]): Promise<AnimationResult> {
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

    // Фон грузим один раз, а не заново на каждом кадре
    const background: Image = await loadImage(`${DEFAULT_IMAGES_CATALOG}/background.jpg`)

    const itemWidthContext: number = itemWidth - itemPadding * 2
    let currentScroll: number = images.length * itemWidth
        - canvasWidth / 2
        - itemWidth / 2
        + Math.floor(Math.random() * itemWidthContext - itemWidthContext / 2)

    // Прокрутку считаем заранее: шаг 0 — остановка, последний шаг — максимальная скорость,
    // а кадры гифки идут в обратном порядке, чтобы барабан замедлялся к концу
    const scrollByStep: number[] = []
    const speedByStep: number[] = []
    for (let step: number = 0; step < decelerationFrames; step++) {
        const t: number = step / decelerationFrames
        const speed: number = Math.min(speedAtMax * t ** 3, speedAtMax)

        currentScroll -= speed
        scrollByStep.push(currentScroll)
        speedByStep.push(speed)
    }

    function drawScene(ctx: SKRSContext2D, step: number): void {
        const scroll: number = scrollByStep[step]
        ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight)

        const visibleStartIndex: number = Math.max(Math.floor(scroll / itemWidth) - 1, 0)
        const visibleEndIndex: number = visibleStartIndex + Math.ceil(canvasWidth / itemWidth) + 2

        for (let i: number = visibleStartIndex; i <= visibleEndIndex; i++) {
            const x: number = i * itemWidth - scroll
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

        updateArrowShake(Math.abs(speedByStep[step]))

        const arrowX: number = canvasWidth / 2 - ARROW_WIDTH / 2 + arrowShakeOffset
        const arrowY: number = canvasHeight - ARROW_HEIGHT - ARROW_Y_OFFSET
        drawArrow(ctx, arrowX, arrowY, ARROW_WIDTH, ARROW_HEIGHT)
    }

    const gifBuffer: Buffer = await renderGif({
        width: canvasWidth,
        height: canvasHeight,
        fps,
        frames: decelerationFrames,
        loop: -1,
        drawFrame: (ctx: SKRSContext2D, frame: number) => drawScene(ctx, decelerationFrames - 1 - frame),
    })

    // Победный кадр — состояние остановки, то есть нулевой шаг расчёта
    const winCanvas: Canvas = createCanvas(canvasWidth, canvasHeight)
    drawScene(winCanvas.getContext('2d'), 0)
    const winBuffer: Buffer = winCanvas.toBuffer('image/jpeg')

    return {
        gifBuffer,
        winBuffer,
    }
}

async function execute(index: number, interaction: ChatInputCommandInteraction, items: Item[]): Promise<void> {
    const randomItems: Item[] = generateWeightedRandomItems(items, itemsCount)

    const gifData: AnimationResult = await animate(randomItems)
    const gifAttachment: AttachmentBuilder = new AttachmentBuilder(gifData.gifBuffer, {
        name: 'slot-machine.gif',
        description: 'Анимация прокрутки'
    })

    const winnerItem: Item = randomItems[randomItems.length - 1]
    const userInventory: Inventory = await InventoryRepository.getCurrentInventory(interaction)

    const inventoryItem: InventoryItem = new InventoryItem()
    inventoryItem.item = winnerItem
    inventoryItem.inventory = userInventory
    await inventoryItem.save()

    const {user: {id}} = interaction
    const options = {
        content: `<@${id}> начал крутить кейс...`,
        files: [gifAttachment]
    }

    let message: Message
    if (index === 0) {
        message = await interaction.editReply(options)
    } else {
        const channel = interaction.channel as GuildTextBasedChannel
        message = await channel.send(options)
    }

    setTimeout(async () => {
        // first we delete the old gif async because otherwise it will start playing again for lil bit
        message.edit({
            content: `<@${id}> выпал предмет \`${winnerItem.name}\` качества \`${winnerItem.quality?.name}\`!`,
            files: []
        })

        const winAttachment: AttachmentBuilder = new AttachmentBuilder(gifData.winBuffer, {
            name: 'win-image.jpeg',
            description: 'Победитель'
        })

        await message.edit({
            files: [winAttachment]
        })
    }, 14000)
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