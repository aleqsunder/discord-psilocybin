import {Canvas, createCanvas, Image, loadImage, SKRSContext2D} from '@napi-rs/canvas'
import {GRID_HEIGHT, GRID_WIDTH, SpinSymbol, SymbolSet} from './config'
import {Cell, Combination, Grid, LineDirection, Position} from './engine'
import {renderGif} from '../../services/GifService'

const CELL_SIZE: number = 84
const CELL_GAP: number = 8
const CELL_PITCH: number = CELL_SIZE + CELL_GAP
const PADDING: number = 24

const GRID_PIXEL_WIDTH: number = GRID_WIDTH * CELL_SIZE + (GRID_WIDTH - 1) * CELL_GAP
const GRID_PIXEL_HEIGHT: number = GRID_HEIGHT * CELL_SIZE + (GRID_HEIGHT - 1) * CELL_GAP

export const CANVAS_WIDTH: number = GRID_PIXEL_WIDTH + PADDING * 2
export const CANVAS_HEIGHT: number = GRID_PIXEL_HEIGHT + PADDING * 2

const SYMBOL_SIZE: number = 54
const CELL_RADIUS: number = 14

const BACKGROUND_TOP: string = '#141A2B'
const BACKGROUND_BOTTOM: string = '#0B0F1A'
const CELL_FILL: string = 'rgba(255, 255, 255, 0.05)'
const CELL_STROKE: string = 'rgba(255, 255, 255, 0.08)'
const GOLDEN_TOP: string = 'rgba(255, 201, 60, 0.38)'
const GOLDEN_BOTTOM: string = 'rgba(224, 138, 75, 0.16)'
const GOLDEN_STROKE: string = '#FFC93C'

// Разные направления подсвечиваем разными цветами: комбинации могут пересекаться
const DIRECTION_COLORS: Record<LineDirection, string> = {
    [LineDirection.HORIZONTAL]: '#6EE7F9',
    [LineDirection.VERTICAL]: '#A78BFA',
    [LineDirection.DIAGONAL_DOWN]: '#4ADE80',
    [LineDirection.DIAGONAL_UP]: '#FB7185',
    [LineDirection.W]: '#FFC93C',
    [LineDirection.M]: '#FDBA74',
    [LineDirection.MINI_W]: '#FDE68A',
    [LineDirection.MINI_M]: '#FCD34D',
    [LineDirection.V]: '#38BDF8',
    [LineDirection.LAMBDA]: '#818CF8',
    [LineDirection.STAIRS_DOWN]: '#34D399',
    [LineDirection.STAIRS_UP]: '#2DD4BF',
    [LineDirection.EVERY_COLUMN]: '#E879F9',
    [LineDirection.EVERY_ROW]: '#F472B6',
}

// Картинки символов заранее уменьшаются до размера клетки: масштабировать их
// на каждом кадре гифки заметно дороже, чем копировать готовый спрайт.
//
// Ключ — путь к файлу, а не id символа: при замене картинки путь меняется вместе с ней,
// поэтому новый спрайт подхватывается сам и старый не залипает в кэше
const spriteCache: Map<string, Canvas> = new Map()

async function buildSprite(imagePath: string): Promise<Canvas> {
    const sprite: Canvas = createCanvas(SYMBOL_SIZE, SYMBOL_SIZE)
    const context: SKRSContext2D = sprite.getContext('2d')
    const image: Image = await loadImage(imagePath)

    context.drawImage(image, 0, 0, SYMBOL_SIZE, SYMBOL_SIZE)
    return sprite
}

// Спрайты грузятся один раз на картинку и переиспользуются всеми спинами
export async function warmUpSprites(symbols: SymbolSet): Promise<void> {
    for (const symbol of symbols.all) {
        if (spriteCache.has(symbol.imagePath)) {
            continue
        }

        try {
            spriteCache.set(symbol.imagePath, await buildSprite(symbol.imagePath))
        } catch (error) {
            console.error(`Не удалось загрузить картинку символа ${symbol.name}:`, error)
        }
    }

    // Пути заменённых картинок больше не нужны
    const alive: Set<string> = new Set(symbols.all.map((symbol: SpinSymbol) => symbol.imagePath))
    for (const imagePath of spriteCache.keys()) {
        if (!alive.has(imagePath)) {
            spriteCache.delete(imagePath)
        }
    }
}

function getSymbolSprite(symbols: SymbolSet, symbolId: string): Canvas|null {
    const imagePath: string|undefined = symbols.byId[symbolId]?.imagePath
    return imagePath ? spriteCache.get(imagePath) ?? null : null
}

function cellX(col: number): number {
    return PADDING + col * CELL_PITCH
}

function cellY(row: number): number {
    return PADDING + row * CELL_PITCH
}

function drawBackground(context: SKRSContext2D): void {
    const gradient = context.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    gradient.addColorStop(0, BACKGROUND_TOP)
    gradient.addColorStop(1, BACKGROUND_BOTTOM)

    context.fillStyle = gradient
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
}

function drawCellPlate(context: SKRSContext2D, x: number, y: number, golden: boolean): void {
    context.save()
    context.beginPath()
    context.roundRect(x, y, CELL_SIZE, CELL_SIZE, CELL_RADIUS)
    context.closePath()

    if (golden) {
        const gradient = context.createLinearGradient(x, y, x, y + CELL_SIZE)
        gradient.addColorStop(0, GOLDEN_TOP)
        gradient.addColorStop(1, GOLDEN_BOTTOM)
        context.fillStyle = gradient
    } else {
        context.fillStyle = CELL_FILL
    }

    context.fill()

    context.lineWidth = golden ? 2 : 1
    context.strokeStyle = golden ? GOLDEN_STROKE : CELL_STROKE
    context.stroke()
    context.restore()
}

function drawSymbol(context: SKRSContext2D, symbols: SymbolSet, symbolId: string, centerX: number, centerY: number): void {
    const sprite: Canvas|null = getSymbolSprite(symbols, symbolId)
    if (!sprite) {
        return
    }

    context.drawImage(sprite, centerX - SYMBOL_SIZE / 2, centerY - SYMBOL_SIZE / 2)
}

function drawCell(context: SKRSContext2D, symbols: SymbolSet, cell: Cell, x: number, y: number): void {
    drawCellPlate(context, x, y, cell.golden)
    drawSymbol(context, symbols, cell.symbolId, x + CELL_SIZE / 2, y + CELL_SIZE / 2)
}

function drawGridCells(context: SKRSContext2D, symbols: SymbolSet, grid: Grid): void {
    for (let row: number = 0; row < GRID_HEIGHT; row++) {
        for (let col: number = 0; col < GRID_WIDTH; col++) {
            drawCell(context, symbols, grid[row][col], cellX(col), cellY(row))
        }
    }
}

// Комбинаций за спин может собраться много, и все сразу превращают поле в кашу.
// Рисуем только самые дорогие, остальные перечислены в тексте сообщения
const MAX_HIGHLIGHTED: number = 4

export function pickHighlighted(combinations: Combination[]): Combination[] {
    return [...combinations]
        .sort((a: Combination, b: Combination) => b.payout - a.payout)
        .slice(0, MAX_HIGHLIGHTED)
}

// Подсветка: рамка вокруг клеток комбинации и линия, проходящая через их центры
function drawCombination(context: SKRSContext2D, combination: Combination, alpha: number): void {
    const color: string = DIRECTION_COLORS[combination.direction]

    context.save()
    context.globalAlpha = alpha

    context.strokeStyle = color
    context.lineWidth = 3
    context.shadowColor = color
    context.shadowBlur = 14

    for (const {row, col} of combination.cells) {
        context.beginPath()
        context.roundRect(cellX(col) - 2, cellY(row) - 2, CELL_SIZE + 4, CELL_SIZE + 4, CELL_RADIUS + 2)
        context.closePath()
        context.stroke()
    }

    context.beginPath()
    combination.cells.forEach(({row, col}: Position, index: number) => {
        const x: number = cellX(col) + CELL_SIZE / 2
        const y: number = cellY(row) + CELL_SIZE / 2

        if (index === 0) {
            context.moveTo(x, y)
        } else {
            context.lineTo(x, y)
        }
    })

    context.lineWidth = 5
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.globalAlpha = alpha * 0.75
    context.stroke()
    context.restore()
}

export async function renderField(
    symbols: SymbolSet,
    grid: Grid,
    combinations: Combination[] = []
): Promise<Buffer> {
    await warmUpSprites(symbols)

    const canvas: Canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
    const context: SKRSContext2D = canvas.getContext('2d')

    drawBackground(context)
    drawGridCells(context, symbols, grid)

    for (const combination of pickHighlighted(combinations)) {
        drawCombination(context, combination, 1)
    }

    return canvas.encode('png')
}

// Кадры и размер поля подобраны так, чтобы гифка весила около 400 КБ:
// её отдача в дискорд занимает больше времени, чем рендер
const FPS: number = 16
const FIRST_STOP_FRAME: number = 16
const STOP_STEP_FRAMES: number = 5
const HIGHLIGHT_FRAMES: number = 20
const REEL_LENGTH: number = 26
// Доля окна подсветки, после которой пульсация замирает на полной яркости.
// 0.625 — точка, где синус как раз доходит до единицы, поэтому переход выходит плавным
const HIGHLIGHT_SETTLE_PHASE: number = 0.625

function easeOutCubic(value: number): number {
    return 1 - Math.pow(1 - value, 3)
}

function randomSymbolId(symbols: SymbolSet): string {
    const all: SpinSymbol[] = symbols.all
    return all[Math.floor(Math.random() * all.length)].id
}

interface Reel {
    // Снизу вверх: последние GRID_HEIGHT элементов — итоговая колонка
    symbols: string[]
    stopFrame: number
}

function buildReels(grid: Grid, symbols: SymbolSet): Reel[] {
    const reels: Reel[] = []

    for (let col: number = 0; col < GRID_WIDTH; col++) {
        const reelSymbols: string[] = []
        for (let index: number = 0; index < REEL_LENGTH - GRID_HEIGHT; index++) {
            reelSymbols.push(randomSymbolId(symbols))
        }

        for (let row: number = 0; row < GRID_HEIGHT; row++) {
            reelSymbols.push(grid[row][col].symbolId)
        }

        reels.push({symbols: reelSymbols, stopFrame: FIRST_STOP_FRAME + col * STOP_STEP_FRAMES})
    }

    return reels
}

function drawSpinningColumn(
    context: SKRSContext2D,
    symbols: SymbolSet,
    reel: Reel,
    col: number,
    frame: number
): void {
    const progress: number = Math.min(1, frame / reel.stopFrame)
    const distance: number = (REEL_LENGTH - GRID_HEIGHT) * CELL_PITCH
    const offset: number = (1 - easeOutCubic(progress)) * distance

    const x: number = cellX(col)
    // Пропускаем символы, уехавшие выше холста, и обрываем цикл на первом уехавшем ниже
    const aboveCanvas: number = (REEL_LENGTH - GRID_HEIGHT) - (PADDING + offset + CELL_SIZE) / CELL_PITCH
    const firstVisible: number = Math.max(0, Math.ceil(aboveCanvas))

    for (let index: number = firstVisible; index < REEL_LENGTH; index++) {
        const y: number = cellY(index - (REEL_LENGTH - GRID_HEIGHT)) + offset
        if (y > CANVAS_HEIGHT) {
            break
        }

        if (y + CELL_SIZE < 0) {
            continue
        }

        drawCellPlate(context, x, y, false)
        drawSymbol(context, symbols, reel.symbols[index], x + CELL_SIZE / 2, y + CELL_SIZE / 2)
    }
}

export async function renderSpinGif(
    symbols: SymbolSet,
    grid: Grid,
    combinations: Combination[]
): Promise<{buffer: Buffer, durationMs: number}> {
    await warmUpSprites(symbols)

    const highlighted: Combination[] = pickHighlighted(combinations)
    const reels: Reel[] = buildReels(grid, symbols)
    const lastStopFrame: number = reels[reels.length - 1].stopFrame
    const frames: number = lastStopFrame + HIGHLIGHT_FRAMES

    const buffer: Buffer = await renderGif({
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        fps: FPS,
        frames,
        // Один прогон: гифка не должна крутиться по кругу после остановки барабанов
        loop: -1,
        drawFrame: (context: SKRSContext2D, frame: number) => {
            drawBackground(context)

            context.save()
            context.beginPath()
            context.rect(PADDING, PADDING, GRID_PIXEL_WIDTH, GRID_PIXEL_HEIGHT)
            context.closePath()
            context.clip()

            for (let col: number = 0; col < GRID_WIDTH; col++) {
                const reel: Reel = reels[col]
                if (frame >= reel.stopFrame) {
                    for (let row: number = 0; row < GRID_HEIGHT; row++) {
                        drawCell(context, symbols, grid[row][col], cellX(col), cellY(row))
                    }

                    continue
                }

                drawSpinningColumn(context, symbols, reel, col, frame)
            }

            context.restore()

            if (frame < lastStopFrame) {
                return
            }

            // После остановки подсветка пульсирует, а в конце замирает на полной яркости.
            // Гифка не зациклена, поэтому последний кадр совпадает с картинкой результата —
            // и подмена гифки на картинку проходит незаметно, даже если дискорд подтормозит
            const phase: number = (frame - lastStopFrame) / HIGHLIGHT_FRAMES
            const alpha: number = phase >= HIGHLIGHT_SETTLE_PHASE
                ? 1
                : 0.55 + 0.45 * Math.sin(phase * Math.PI * 4)

            for (const combination of highlighted) {
                drawCombination(context, combination, alpha)
            }
        },
    })

    return {buffer, durationMs: Math.round((frames / FPS) * 1000)}
}
