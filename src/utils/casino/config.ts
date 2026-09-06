import {DEFAULT_CASINO_CATALOG} from '../../constants'

// Настройки баланса казино. Сами фрукты настраиваются через /admin casino,
// а бонусные символы заданы здесь и не редактируются.

export enum SymbolKind {
    FRUIT = 'fruit',
    FREE_SPIN = 'free-spin',
    MULTIPLIER = 'multiplier',
}

export interface SpinSymbol {
    id: string
    name: string
    imagePath: string
    kind: SymbolKind
    // Вес в общей корзине: чем больше, тем чаще выпадает символ
    weight: number
    // Базовая выплата за комбинацию в долях от ставки (только для фруктов)
    payout: number
    // Множитель итогового выигрыша (только для символов-множителей)
    multiplier?: number
}

// Бонусные символы: билет на фриспин и множители. В комбинации не участвуют
export const BONUS_SYMBOLS: SpinSymbol[] = [
    {
        id: 'free-spin',
        name: 'Фриспин',
        imagePath: `${DEFAULT_CASINO_CATALOG}/free-spin.png`,
        kind: SymbolKind.FREE_SPIN,
        weight: 0.8,
        payout: 0,
    },
    {
        id: 'x2',
        name: 'Множитель x2',
        imagePath: `${DEFAULT_CASINO_CATALOG}/x2.png`,
        kind: SymbolKind.MULTIPLIER,
        weight: 1.4,
        payout: 0,
        multiplier: 2,
    },
    {
        id: 'x4',
        name: 'Множитель x4',
        imagePath: `${DEFAULT_CASINO_CATALOG}/x4.png`,
        kind: SymbolKind.MULTIPLIER,
        weight: 0.5,
        payout: 0,
        multiplier: 4,
    },
    {
        id: 'x8',
        name: 'Множитель x8',
        imagePath: `${DEFAULT_CASINO_CATALOG}/x8.png`,
        kind: SymbolKind.MULTIPLIER,
        weight: 0.1,
        payout: 0,
        multiplier: 8,
    },
]

// Фрукты, которые заводятся новому серверу при первом запуске казино
export const DEFAULT_FRUITS: Array<{name: string, image: string, weight: number, payout: number}> = [
    {name: 'Вишня', image: 'cherry.png', weight: 22, payout: 0.35},
    {name: 'Лимон', image: 'lemon.png', weight: 20, payout: 0.45},
    {name: 'Апельсин', image: 'orange.png', weight: 18, payout: 0.6},
    {name: 'Виноград', image: 'grapes.png', weight: 15, payout: 0.85},
    {name: 'Арбуз', image: 'watermelon.png', weight: 11, payout: 1.25},
    {name: 'Клубника', image: 'strawberry.png', weight: 7, payout: 2},
    {name: 'Алмаз', image: 'diamond.png', weight: 3, payout: 4},
]

export const GRID_WIDTH: number = 5
export const GRID_HEIGHT: number = 3

// Ставка за спин: значение по умолчанию и границы, в которых её можно задать вручную
export const SPIN_COST: number = 100
export const MIN_BET: number = 100
export const MAX_BET: number = 10000

// За полный пакет один спин идёт бесплатно: 10 спинов стоят столько же, сколько 9
export const MAX_SPINS_PER_PURCHASE: number = 10
export const BULK_FREE_SPINS: number = 1

// Шанс того, что клетка окажется золотой
export const GOLDEN_CELL_CHANCE: number = 0.05

// Все бонусы комбинации складываются, а не перемножаются: каждый добавляет только свой прирост
// сверх единицы. Золото x1.5 вместе с пятёркой x1.6 дают x2.1, а не x2.4 — единица берётся один раз.
//
// Прирост за каждую золотую клетку в комбинации
export const GOLDEN_CELL_BONUS: number = 0.5
// Множитель за длину линии: за три символа надбавки нет, дальше каждый добавляет по 0.3
export const LENGTH_BONUS: Record<number, number> = {3: 1, 4: 1.3, 5: 1.6}

// Минимальная длина прямой линии
export const MIN_LINE_LENGTH: number = 3
// Выплата за поле из одного фрукта, в ставках
export const SUPER_WIN_PAYOUT: number = 500

// Разброс — не линия, поэтому платится по ставке за три символа и с понижающим коэффициентом.
// Строк в поле всего три, и фрукт попадает в каждую почти всегда, поэтому строковый разброс
// стоит заметно дешевле столбцового
export const SCATTER_COLUMN_BONUS: number = 1
export const SCATTER_ROW_BONUS: number = 0.15

// Если за столько спинов подряд ничего не выпало, следующий спин гарантированно даёт выигрыш
export const PITY_DRY_SPINS: number = 4
// Какую долю оборота казино возвращает игрокам на дистанции. Считается по общему банку сервера,
// а не по каждому игроку: проигрыш одного наполняет банк, и следующий игрок может его забрать.
// Оставшиеся (1 - TARGET_RETURN_RATE) — резерв, который казино старается удерживать при себе
export const TARGET_RETURN_RATE: number = 0.92
// Изредка позволяем игроку выйти за резерв банка — иначе казино выглядит слишком механическим
export const JACKPOT_CHANCE: number = 0.02
// Насколько мягко режется выигрыш, вылезающий за резерв, в ставках.
// Чем больше значение, тем реальнее увидеть крупную комбинацию при пустом банке
export const OVERSHOOT_TOLERANCE: number = 25
// Сколько раз пробуем перекрутить исход, прежде чем принять его как есть
export const MAX_SPIN_ATTEMPTS: number = 24

// Набор символов конкретного сервера: фрукты из базы плюс неизменяемые бонусы
export interface SymbolSet {
    all: SpinSymbol[]
    byId: Record<string, SpinSymbol>
    fruits: SpinSymbol[]
    // Самые дешёвые фрукты нужны для гарантированного выигрыша: он должен быть скромным
    cheapestFruits: SpinSymbol[]
}

export function buildSymbolSet(fruits: SpinSymbol[]): SymbolSet {
    const all: SpinSymbol[] = [...fruits, ...BONUS_SYMBOLS]
    const sortedByPayout: SpinSymbol[] = [...fruits].sort((a, b) => a.payout - b.payout)

    return {
        all,
        byId: Object.fromEntries(all.map(symbol => [symbol.id, symbol])),
        fruits,
        cheapestFruits: sortedByPayout.slice(0, Math.max(1, Math.ceil(sortedByPayout.length / 2))),
    }
}
