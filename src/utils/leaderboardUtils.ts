import {AttachmentBuilder} from 'discord.js'
import {Canvas, createCanvas, Image, loadImage, SKRSContext2D} from '@napi-rs/canvas'
import {truncateTextWithEllipsis} from './paginationUtils'
import {formatPoints} from './formatUtils'

export interface LeaderboardEntry {
    position: number
    name: string
    points: number
    avatarUrl: string|null
    userId: string
}

export interface LeaderboardOptions {
    title: string
    entries: LeaderboardEntry[]
}

const WIDTH: number = 1000
const PADDING: number = 48
const CONTENT_WIDTH: number = WIDTH - PADDING * 2

const HEADER_HEIGHT: number = 96
const PODIUM_HEIGHT: number = 276
const PODIUM_GAP: number = 20
const PODIUM_TOP_OFFSET: number = 44
const ROW_HEIGHT: number = 72
const ROW_GAP: number = 12
const ROWS_TOP_OFFSET: number = 36
const BOTTOM_PADDING: number = 24

const TEXT_PRIMARY: string = '#F3F6FC'
const TEXT_MUTED: string = '#94A0B8'
const ACCENT: string = '#6EE7F9'
const ACCENT_LIGHT: string = '#D8FAFF'
const PLATE_FILL: string = 'rgba(14, 18, 28, 0.74)'
const PLATE_STROKE: string = 'rgba(255, 255, 255, 0.09)'
const OUTLINE: string = 'rgba(8, 11, 18, 0.78)'

const MEDALS: string[] = ['#FFC93C', '#C9D4E3', '#E08A4B']
const DEFAULT_RANK_COLOR: string = '#586178'

function rankColor(position: number): string {
    return MEDALS[position - 1] ?? DEFAULT_RANK_COLOR
}

function withAlpha(hex: string, alpha: number): string {
    const value: number = parseInt(hex.slice(1), 16)
    const r: number = (value >> 16) & 255
    const g: number = (value >> 8) & 255
    const b: number = value & 255

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function hashToHue(seed: string): number {
    let hash: number = 0
    for (let i: number = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) % 360
    }

    return hash
}

function fitFontSize(
    ctx: SKRSContext2D,
    text: string,
    maxWidth: number,
    maxSize: number,
    minSize: number,
    family: string
): number {
    let size: number = maxSize
    while (size > minSize) {
        ctx.font = `${size}px "${family}", serif`
        if (ctx.measureText(text).width <= maxWidth) {
            break
        }

        size -= 1
    }

    ctx.font = `${size}px "${family}", serif`
    return size
}

function drawSpacedText(
    ctx: SKRSContext2D,
    text: string,
    x: number, y: number,
    spacing: number,
    mode: 'fill'|'stroke' = 'fill'
): void {
    let cursor: number = x
    for (const char of text) {
        if (mode === 'stroke') {
            ctx.strokeText(char, cursor, y)
        } else {
            ctx.fillText(char, cursor, y)
        }

        cursor += ctx.measureText(char).width + spacing
    }
}

function drawCard(
    ctx: SKRSContext2D,
    x: number, y: number,
    width: number, height: number,
    radius: number,
    fill: string = PLATE_FILL,
    stroke: string = PLATE_STROKE
): void {
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, radius)
    ctx.closePath()

    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetY = 6
    ctx.fillStyle = fill
    ctx.fill()

    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
    ctx.lineWidth = 1
    ctx.strokeStyle = stroke
    ctx.stroke()
    ctx.restore()
}

function drawDiamond(ctx: SKRSContext2D, cx: number, cy: number, size: number, color: string = ACCENT): void {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(Math.PI / 4)

    ctx.beginPath()
    ctx.roundRect(-size / 2, -size / 2, size, size, size * 0.2)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()

    ctx.beginPath()
    ctx.roundRect(-size * 0.15, -size * 0.15, size * 0.3, size * 0.3, size * 0.08)
    ctx.closePath()
    ctx.fillStyle = ACCENT_LIGHT
    ctx.fill()
    ctx.restore()
}

function drawCrown(ctx: SKRSContext2D, cx: number, cy: number, width: number, color: string): void {
    const height: number = width * 0.68
    const left: number = cx - width / 2
    const top: number = cy - height / 2
    const bottom: number = cy + height / 2

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(left, bottom)
    ctx.lineTo(left, top + height * 0.3)
    ctx.lineTo(left + width * 0.27, top + height * 0.66)
    ctx.lineTo(cx, top)
    ctx.lineTo(left + width * 0.73, top + height * 0.66)
    ctx.lineTo(left + width, top + height * 0.3)
    ctx.lineTo(left + width, bottom)
    ctx.closePath()

    ctx.fillStyle = color
    ctx.shadowColor = 'rgba(8, 11, 18, 0.6)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetY = 2
    ctx.fill()
    ctx.restore()
}

function drawAvatar(
    ctx: SKRSContext2D,
    image: Image|null,
    entry: LeaderboardEntry,
    cx: number, cy: number,
    radius: number,
    ringColor: string,
    ringWidth: number
): void {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    if (image) {
        ctx.drawImage(image, cx - radius, cy - radius, radius * 2, radius * 2)
    } else {
        const hue: number = hashToHue(entry.userId)
        ctx.fillStyle = `hsl(${hue}, 42%, 34%)`
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)

        ctx.fillStyle = TEXT_PRIMARY
        ctx.font = `${Math.round(radius)}px "montserrat-medium", serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText((entry.name[0] ?? '?').toUpperCase(), cx, cy + radius * 0.04)
    }

    ctx.restore()

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius + ringWidth / 2, 0, Math.PI * 2)
    ctx.lineWidth = ringWidth
    ctx.strokeStyle = ringColor
    ctx.shadowColor = withAlpha(ringColor, 0.5)
    ctx.shadowBlur = ringWidth * 4
    ctx.stroke()
    ctx.restore()
}

function drawRankBadge(ctx: SKRSContext2D, position: number, cx: number, cy: number, radius: number): void {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.closePath()

    ctx.fillStyle = rankColor(position)
    ctx.fill()

    ctx.lineWidth = 3
    ctx.strokeStyle = '#0C111C'
    ctx.stroke()

    ctx.fillStyle = '#10141F'
    ctx.font = `${Math.round(radius * 1.15)}px "montserrat-medium", serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(position), cx, cy + 1)
    ctx.restore()
}

function drawPointsLine(
    ctx: SKRSContext2D,
    points: number,
    cx: number, cy: number,
    fontSize: number,
    maxWidth: number
): void {
    const text: string = formatPoints(points)
    const diamondSize: number = fontSize * 0.62
    const gap: number = fontSize * 0.4

    const size: number = fitFontSize(ctx, text, maxWidth - diamondSize - gap, fontSize, 12, 'montserrat-medium')
    const textWidth: number = ctx.measureText(text).width
    const totalWidth: number = textWidth + gap + diamondSize
    const startX: number = cx - totalWidth / 2

    ctx.save()
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = TEXT_PRIMARY
    ctx.font = `${size}px "montserrat-medium", serif`
    ctx.fillText(text, startX, cy)
    ctx.restore()

    drawDiamond(ctx, startX + textWidth + gap + diamondSize / 2, cy, diamondSize)
}

function drawPodiumCard(
    ctx: SKRSContext2D,
    entry: LeaderboardEntry,
    avatar: Image|null,
    x: number, y: number,
    width: number, height: number,
    avatarRadius: number,
    isChampion: boolean
): void {
    const color: string = rankColor(entry.position)
    const cx: number = x + width / 2

    drawCard(ctx, x, y, width, height, 26, PLATE_FILL, withAlpha(color, 0.34))

    const glow = ctx.createLinearGradient(x, y, x, y + height)
    glow.addColorStop(0, withAlpha(color, isChampion ? 0.2 : 0.12))
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)')

    ctx.save()
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, 26)
    ctx.closePath()
    ctx.clip()
    ctx.fillStyle = glow
    ctx.fillRect(x, y, width, height)
    ctx.restore()

    const avatarCy: number = y + 26 + (isChampion ? 16 : 0) + avatarRadius
    if (isChampion) {
        drawCrown(ctx, cx, y + 24, 44, color)
    }

    drawAvatar(ctx, avatar, entry, cx, avatarCy, avatarRadius, color, 4)
    drawRankBadge(ctx, entry.position, cx + avatarRadius * 0.72, avatarCy + avatarRadius * 0.72, 18)

    const nameBaseline: number = avatarCy + avatarRadius + 44
    const nameSize: number = fitFontSize(ctx, entry.name, width - 40, isChampion ? 24 : 21, 14, 'montserrat-medium')

    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = TEXT_PRIMARY
    ctx.font = `${nameSize}px "montserrat-medium", serif`
    ctx.fillText(truncateTextWithEllipsis(ctx, entry.name, width - 40), cx, nameBaseline)
    ctx.restore()

    drawPointsLine(ctx, entry.points, cx, nameBaseline + 32, isChampion ? 26 : 23, width - 40)
}

function drawListRow(ctx: SKRSContext2D, entry: LeaderboardEntry, avatar: Image|null, y: number): void {
    const x: number = PADDING
    const width: number = CONTENT_WIDTH
    const centerY: number = y + ROW_HEIGHT / 2

    drawCard(ctx, x, y, width, ROW_HEIGHT, 18)

    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = TEXT_MUTED
    ctx.font = '22px "montserrat-medium", serif'
    ctx.fillText(String(entry.position), x + 36, centerY + 1)
    ctx.restore()

    drawAvatar(ctx, avatar, entry, x + 94, centerY, 22, 'rgba(255, 255, 255, 0.14)', 2)

    const pointsText: string = formatPoints(entry.points)
    ctx.font = '20px "montserrat-medium", serif'
    const pointsWidth: number = ctx.measureText(pointsText).width
    const diamondSize: number = 13
    const pointsRight: number = x + width - 26
    const pointsLeft: number = pointsRight - diamondSize - 10 - pointsWidth

    ctx.save()
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = TEXT_PRIMARY
    ctx.fillText(pointsText, pointsRight - diamondSize - 10, centerY)
    ctx.restore()

    drawDiamond(ctx, pointsRight - diamondSize / 2, centerY, diamondSize)

    const nameX: number = x + 130
    ctx.save()
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = TEXT_PRIMARY
    ctx.font = '20px "montserrat-medium", serif'
    ctx.fillText(truncateTextWithEllipsis(ctx, entry.name, Math.max(60, pointsLeft - 20 - nameX)), nameX, centerY + 1)
    ctx.restore()
}

function drawHeader(ctx: SKRSContext2D, title: string): void {
    const barX: number = PADDING
    const barY: number = 32
    const barHeight: number = 36

    const barGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight)
    barGradient.addColorStop(0, MEDALS[0])
    barGradient.addColorStop(1, '#E08A4B')

    ctx.save()
    ctx.beginPath()
    ctx.roundRect(barX, barY, 5, barHeight, 3)
    ctx.closePath()
    ctx.shadowColor = OUTLINE
    ctx.shadowBlur = 10
    ctx.fillStyle = barGradient
    ctx.fill()
    ctx.restore()

    ctx.save()
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.font = '34px "montserrat-medium", serif'
    ctx.lineJoin = 'round'
    ctx.miterLimit = 2

    ctx.strokeStyle = OUTLINE
    ctx.lineWidth = 5
    ctx.shadowColor = 'rgba(8, 11, 18, 0.5)'
    ctx.shadowBlur = 12
    drawSpacedText(ctx, title, barX + 22, barY + 29, 5, 'stroke')

    const titleGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight)
    titleGradient.addColorStop(0, '#FFDF8A')
    titleGradient.addColorStop(1, '#F0A93F')

    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.fillStyle = titleGradient
    drawSpacedText(ctx, title, barX + 22, barY + 29, 5)
    ctx.restore()
}

export async function loadAvatar(url: string|null): Promise<Image|null> {
    if (!url) {
        return null
    }

    try {
        const response = await fetch(url)
        if (!response.ok) {
            return null
        }

        return await loadImage(Buffer.from(await response.arrayBuffer()))
    } catch (e) {
        return null
    }
}

export async function renderLeaderboard(options: LeaderboardOptions): Promise<AttachmentBuilder> {
    const {title, entries} = options
    const podium: LeaderboardEntry[] = entries.slice(0, 3)
    const rest: LeaderboardEntry[] = entries.slice(3)

    const rowsHeight: number = rest.length > 0
        ? ROWS_TOP_OFFSET + rest.length * (ROW_HEIGHT + ROW_GAP) - ROW_GAP
        : 0
    const height: number = HEADER_HEIGHT + PODIUM_HEIGHT + rowsHeight + BOTTOM_PADDING

    const canvas: Canvas = createCanvas(WIDTH, height)
    const ctx: SKRSContext2D = canvas.getContext('2d')
    const avatars: (Image|null)[] = await Promise.all(entries.map(entry => loadAvatar(entry.avatarUrl)))

    drawHeader(ctx, title)

    const cardWidth: number = (CONTENT_WIDTH - PODIUM_GAP * 2) / 3
    const podiumTop: number = HEADER_HEIGHT
    const order: number[] = podium.length === 3 ? [1, 0, 2] : podium.map((entry, index) => index)
    const groupWidth: number = order.length * cardWidth + (order.length - 1) * PODIUM_GAP
    const groupLeft: number = (WIDTH - groupWidth) / 2

    for (let slot: number = 0; slot < order.length; slot++) {
        const index: number = order[slot]
        const entry: LeaderboardEntry = podium[index]
        const isChampion: boolean = entry.position === 1

        drawPodiumCard(
            ctx,
            entry,
            avatars[index],
            groupLeft + slot * (cardWidth + PODIUM_GAP),
            podiumTop + (isChampion ? 0 : PODIUM_TOP_OFFSET),
            cardWidth,
            isChampion ? PODIUM_HEIGHT : PODIUM_HEIGHT - PODIUM_TOP_OFFSET,
            isChampion ? 58 : 46,
            isChampion,
        )
    }

    let rowY: number = podiumTop + PODIUM_HEIGHT + ROWS_TOP_OFFSET
    for (let index: number = 0; index < rest.length; index++) {
        drawListRow(ctx, rest[index], avatars[index + 3], rowY)
        rowY += ROW_HEIGHT + ROW_GAP
    }

    return new AttachmentBuilder(await canvas.encode('png'), {name: 'leaderboard.png'})
}
