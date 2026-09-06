import {
    BULK_FREE_SPINS,
    GOLDEN_CELL_BONUS,
    GOLDEN_CELL_CHANCE,
    GRID_HEIGHT,
    GRID_WIDTH,
    JACKPOT_CHANCE,
    LENGTH_BONUS,
    MAX_SPIN_ATTEMPTS,
    MAX_SPINS_PER_PURCHASE,
    MIN_LINE_LENGTH,
    OVERSHOOT_TOLERANCE,
    PITY_DRY_SPINS,
    SCATTER_COLUMN_BONUS,
    SCATTER_ROW_BONUS,
    SPIN_COST,
    SUPER_WIN_PAYOUT,
    SpinSymbol,
    SymbolKind,
    SymbolSet,
    TARGET_RETURN_RATE,
} from './config'

export interface Cell {
    symbolId: string
    golden: boolean
}

export type Grid = Cell[][]

export interface Position {
    row: number
    col: number
}

export enum LineDirection {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
    DIAGONAL_DOWN = 'diagonal-down',
    DIAGONAL_UP = 'diagonal-up',
    W = 'w',
    M = 'm',
    MINI_W = 'mini-w',
    MINI_M = 'mini-m',
    V = 'v',
    LAMBDA = 'lambda',
    STAIRS_DOWN = 'stairs-down',
    STAIRS_UP = 'stairs-up',
    EVERY_COLUMN = 'every-column',
    EVERY_ROW = 'every-row',
}

export interface Combination {
    direction: LineDirection
    symbolId: string
    cells: Position[]
    goldenCount: number
    // Бонус формы: за зигзаг платят больше, чем за прямую линию той же длины
    shapeBonus: number
    // Итоговый множитель комбинации: форма, длина и золото, сложенные вместе
    multiplier: number
    payout: number
}

export interface SpinOutcome {
    grid: Grid
    combinations: Combination[]
    freeSpins: number
    multiplier: number
    isSuperWin: boolean
    total: number
}

export interface CasinoState {
    // Банк общий на сервер: сколько все игроки вместе занесли и забрали
    bankSpent: number
    bankWon: number
    // Спинов подряд без выигрыша — уже у конкретного игрока
    dryStreak: number
}

interface Line {
    direction: LineDirection
    positions: Position[]
}

interface Pattern {
    direction: LineDirection
    shapeBonus: number
    cells: Position[]
}

// Прямые линии ищутся сериями от трёх символов, фигуры — целиком по шаблону.
// И то и другое считается один раз при загрузке: размер сетки не меняется
const LINES: Line[] = buildLines()
const PATTERNS: Pattern[] = buildPatterns()

function buildLines(): Line[] {
    const lines: Line[] = []

    for (let row: number = 0; row < GRID_HEIGHT; row++) {
        const positions: Position[] = []
        for (let col: number = 0; col < GRID_WIDTH; col++) {
            positions.push({row, col})
        }

        lines.push({direction: LineDirection.HORIZONTAL, positions})
    }

    for (let col: number = 0; col < GRID_WIDTH; col++) {
        const positions: Position[] = []
        for (let row: number = 0; row < GRID_HEIGHT; row++) {
            positions.push({row, col})
        }

        lines.push({direction: LineDirection.VERTICAL, positions})
    }

    // Диагонали короче трёх клеток не нужны: комбинация всё равно не соберётся
    for (let startCol: number = 0; startCol + GRID_HEIGHT <= GRID_WIDTH; startCol++) {
        const down: Position[] = []
        const up: Position[] = []

        for (let step: number = 0; step < GRID_HEIGHT; step++) {
            down.push({row: step, col: startCol + step})
            up.push({row: GRID_HEIGHT - 1 - step, col: startCol + step})
        }

        lines.push({direction: LineDirection.DIAGONAL_DOWN, positions: down})
        lines.push({direction: LineDirection.DIAGONAL_UP, positions: up})
    }

    return lines
}

function zigzag(rows: number[]): Position[] {
    return rows.map((row: number, col: number) => ({row, col}))
}

function buildPatterns(): Pattern[] {
    const bottom: number = GRID_HEIGHT - 1
    const middle: number = Math.floor(GRID_HEIGHT / 2)

    const patterns: Pattern[] = [
        // W и перевёрнутая M во всю высоту поля
        {direction: LineDirection.W, shapeBonus: 2, cells: zigzag([0, bottom, 0, bottom, 0])},
        {direction: LineDirection.M, shapeBonus: 2, cells: zigzag([bottom, 0, bottom, 0, bottom])},
        // Мини-версии с меньшим размахом
        {direction: LineDirection.MINI_W, shapeBonus: 1.5, cells: zigzag([0, middle, 0, middle, 0])},
        {direction: LineDirection.MINI_M, shapeBonus: 1.5, cells: zigzag([bottom, middle, bottom, middle, bottom])},
        // Лесенки через всё поле
        {direction: LineDirection.STAIRS_DOWN, shapeBonus: 1.5, cells: zigzag([0, 0, middle, bottom, bottom])},
        {direction: LineDirection.STAIRS_UP, shapeBonus: 1.5, cells: zigzag([bottom, bottom, middle, 0, 0])},
    ]

    // V и Λ занимают три столбца и могут стоять в любом месте поля
    for (let startCol: number = 0; startCol + 3 <= GRID_WIDTH; startCol++) {
        patterns.push({
            direction: LineDirection.V,
            shapeBonus: 1.5,
            cells: [
                {row: 0, col: startCol},
                {row: bottom, col: startCol + 1},
                {row: 0, col: startCol + 2},
            ],
        })

        patterns.push({
            direction: LineDirection.LAMBDA,
            shapeBonus: 1.5,
            cells: [
                {row: bottom, col: startCol},
                {row: 0, col: startCol + 1},
                {row: bottom, col: startCol + 2},
            ],
        })
    }

    return patterns
}

function pickWeightedSymbol(symbols: SymbolSet): SpinSymbol {
    const totalWeight: number = symbols.all.reduce((sum: number, symbol: SpinSymbol) => sum + symbol.weight, 0)
    let roll: number = Math.random() * totalWeight

    for (const symbol of symbols.all) {
        roll -= symbol.weight
        if (roll <= 0) {
            return symbol
        }
    }

    return symbols.all[symbols.all.length - 1]
}

export function generateGrid(symbols: SymbolSet): Grid {
    const grid: Grid = []

    for (let row: number = 0; row < GRID_HEIGHT; row++) {
        const cells: Cell[] = []
        for (let col: number = 0; col < GRID_WIDTH; col++) {
            cells.push({
                symbolId: pickWeightedSymbol(symbols).id,
                golden: Math.random() < GOLDEN_CELL_CHANCE,
            })
        }

        grid.push(cells)
    }

    return grid
}

// Гарантированный выигрыш подкладываем самой дешёвой линией — игрок что-то получает, но немного
function generateGridWithGuaranteedLine(symbols: SymbolSet): Grid {
    const grid: Grid = generateGrid(symbols)
    const cheapest: SpinSymbol[] = symbols.cheapestFruits
    if (cheapest.length === 0) {
        return grid
    }

    const symbol: SpinSymbol = cheapest[Math.floor(Math.random() * cheapest.length)]
    const row: number = Math.floor(Math.random() * GRID_HEIGHT)
    const startCol: number = Math.floor(Math.random() * (GRID_WIDTH - MIN_LINE_LENGTH + 1))

    for (let offset: number = 0; offset < MIN_LINE_LENGTH; offset++) {
        grid[row][startCol + offset].symbolId = symbol.id
    }

    return grid
}

function isFruit(symbols: SymbolSet, symbolId: string): boolean {
    return symbols.byId[symbolId]?.kind === SymbolKind.FRUIT
}

function buildCombination(
    symbols: SymbolSet,
    grid: Grid,
    bet: number,
    direction: LineDirection,
    symbolId: string,
    cells: Position[],
    shapeBonus: number,
    bonusLength: number = cells.length
): Combination {
    const goldenCount: number = cells.filter(cell => grid[cell.row][cell.col].golden).length
    const lengthBonus: number = LENGTH_BONUS[bonusLength] ?? 1

    // Бонусы складываются приростами сверх единицы, чтобы единица не учитывалась дважды:
    // золото x1.5 и длина x1.6 дают x2.1
    const multiplier: number = Math.max(
        0,
        1 + (shapeBonus - 1) + (lengthBonus - 1) + goldenCount * GOLDEN_CELL_BONUS
    )

    return {
        direction,
        symbolId,
        cells,
        goldenCount,
        shapeBonus,
        multiplier,
        payout: symbols.byId[symbolId].payout * bet * multiplier,
    }
}

// Прямые линии: берём максимальные серии одинаковых фруктов от трёх штук
function findLineCombinations(symbols: SymbolSet, grid: Grid, bet: number): Combination[] {
    const combinations: Combination[] = []

    for (const {direction, positions} of LINES) {
        let runStart: number = 0

        for (let index: number = 1; index <= positions.length; index++) {
            const previous: Position = positions[index - 1]
            const previousId: string = grid[previous.row][previous.col].symbolId

            const current: Position|undefined = positions[index]
            const currentId: string|undefined = current ? grid[current.row][current.col].symbolId : undefined

            if (currentId === previousId) {
                continue
            }

            const length: number = index - runStart
            if (length >= MIN_LINE_LENGTH && isFruit(symbols, previousId)) {
                combinations.push(buildCombination(
                    symbols, grid, bet, direction, previousId, positions.slice(runStart, index), 1
                ))
            }

            runStart = index
        }
    }

    return combinations
}

// Фигуры: клетки шаблона должны быть заняты одним фруктом целиком
function findPatternCombinations(symbols: SymbolSet, grid: Grid, bet: number): Combination[] {
    const combinations: Combination[] = []
    const usedByDirection: Map<LineDirection, Set<string>> = new Map()

    for (const {direction, shapeBonus, cells} of PATTERNS) {
        if (!usedByDirection.has(direction)) {
            usedByDirection.set(direction, new Set())
        }

        // Внутри одного вида фигуры комбинации не пересекаются, как и прямые линии
        const used: Set<string> = usedByDirection.get(direction)!
        if (cells.some(cell => used.has(`${cell.row}:${cell.col}`))) {
            continue
        }

        const symbolId: string = grid[cells[0].row][cells[0].col].symbolId
        if (!isFruit(symbols, symbolId)) {
            continue
        }

        if (!cells.every(cell => grid[cell.row][cell.col].symbolId === symbolId)) {
            continue
        }

        combinations.push(buildCombination(symbols, grid, bet, direction, symbolId, cells, shapeBonus))
        cells.forEach(cell => used.add(`${cell.row}:${cell.col}`))
    }

    return combinations
}

// Разброс: фрукт есть в каждом столбце (или в каждой строке), где именно — неважно.
// Формa свободная, поэтому бонуса за неё нет
function findScatterCombinations(symbols: SymbolSet, grid: Grid, bet: number): Combination[] {
    const combinations: Combination[] = []

    for (const symbol of symbols.fruits) {
        const byColumn: Position[] = []
        for (let col: number = 0; col < GRID_WIDTH; col++) {
            for (let row: number = 0; row < GRID_HEIGHT; row++) {
                if (grid[row][col].symbolId === symbol.id) {
                    byColumn.push({row, col})
                    break
                }
            }
        }

        if (byColumn.length === GRID_WIDTH) {
            combinations.push(buildCombination(
                symbols, grid, bet, LineDirection.EVERY_COLUMN, symbol.id, byColumn, SCATTER_COLUMN_BONUS, MIN_LINE_LENGTH
            ))
        }

        const byRow: Position[] = []
        for (let row: number = 0; row < GRID_HEIGHT; row++) {
            for (let col: number = 0; col < GRID_WIDTH; col++) {
                if (grid[row][col].symbolId === symbol.id) {
                    byRow.push({row, col})
                    break
                }
            }
        }

        if (byRow.length === GRID_HEIGHT) {
            combinations.push(buildCombination(
                symbols, grid, bet, LineDirection.EVERY_ROW, symbol.id, byRow, SCATTER_ROW_BONUS, MIN_LINE_LENGTH
            ))
        }
    }

    return combinations
}

export function findCombinations(symbols: SymbolSet, grid: Grid, bet: number): Combination[] {
    return [
        ...findLineCombinations(symbols, grid, bet),
        ...findPatternCombinations(symbols, grid, bet),
        ...findScatterCombinations(symbols, grid, bet),
    ]
}

function isSuperWin(symbols: SymbolSet, grid: Grid): boolean {
    const first: string = grid[0][0].symbolId
    if (!isFruit(symbols, first)) {
        return false
    }

    return grid.every(row => row.every(cell => cell.symbolId === first))
}

export function evaluateGrid(symbols: SymbolSet, grid: Grid, bet: number): SpinOutcome {
    const combinations: Combination[] = findCombinations(symbols, grid, bet)
    const superWin: boolean = isSuperWin(symbols, grid)

    let freeSpins: number = 0
    let multiplier: number = 1

    for (const row of grid) {
        for (const cell of row) {
            const symbol: SpinSymbol|undefined = symbols.byId[cell.symbolId]
            if (symbol?.kind === SymbolKind.FREE_SPIN) {
                freeSpins++
            }

            if (symbol?.kind === SymbolKind.MULTIPLIER && symbol.multiplier) {
                multiplier *= symbol.multiplier
            }
        }
    }

    const linesPayout: number = combinations.reduce((sum: number, combination: Combination) => sum + combination.payout, 0)
    const superPayout: number = superWin ? SUPER_WIN_PAYOUT * bet : 0
    const total: number = Math.round((linesPayout + superPayout) * multiplier)

    return {grid, combinations, freeSpins, multiplier, isSuperWin: superWin, total}
}

// Насколько охотно казино пропускает такой выигрыш.
//
// Всё решает общий банк сервера: если кто-то слил крупную сумму, резерв банка вырос,
// и следующий игрок спокойно забирает эти деньги себе. Казино режет выигрыш только тогда,
// когда он выходит за резерв, и чем сильнее выходит, тем реже пропускает. Поэтому очень жирная
// комбинация всё же может увести банк в минус — а дальше он сам подтянет выплаты обратно
export function acceptChance(outcome: SpinOutcome, state: CasinoState, bet: number): number {
    if (outcome.total <= 0) {
        return 1
    }

    const reserve: number = state.bankSpent - state.bankWon
    // Часть оборота казино старается удержать при себе — это и есть его доход на дистанции
    const targetReserve: number = state.bankSpent * (1 - TARGET_RETURN_RATE)
    const surplus: number = reserve - targetReserve

    if (outcome.total <= surplus) {
        return 1
    }

    const overshoot: number = (outcome.total - surplus) / bet
    return JACKPOT_CHANCE / (1 + Math.max(0, overshoot) / OVERSHOOT_TOLERANCE)
}

function isAcceptable(outcome: SpinOutcome, state: CasinoState, bet: number, needWin: boolean): boolean {
    if (needWin && outcome.total <= 0) {
        return false
    }

    return Math.random() < acceptChance(outcome, state, bet)
}

// За полный пакет один спин бесплатный, поэтому 9 и 10 спинов стоят одинаково при любой ставке
export function calculateSpinCost(count: number, bet: number = SPIN_COST): number {
    const freeSpins: number = count >= MAX_SPINS_PER_PURCHASE ? BULK_FREE_SPINS : 0
    return (count - freeSpins) * bet
}

export function playSpin(symbols: SymbolSet, state: CasinoState, bet: number): SpinOutcome {
    const needWin: boolean = state.dryStreak >= PITY_DRY_SPINS
    let fallback: SpinOutcome|null = null

    for (let attempt: number = 0; attempt < MAX_SPIN_ATTEMPTS; attempt++) {
        const grid: Grid = needWin ? generateGridWithGuaranteedLine(symbols) : generateGrid(symbols)
        const outcome: SpinOutcome = evaluateGrid(symbols, grid, bet)

        if (isAcceptable(outcome, state, bet, needWin)) {
            return outcome
        }

        // Держим наименее щедрый исход на случай, если ни один не пройдёт проверку
        if (!fallback || outcome.total < fallback.total) {
            fallback = outcome
        }
    }

    return fallback as SpinOutcome
}
