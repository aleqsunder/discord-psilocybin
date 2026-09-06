import {Snowflake} from 'discord.js'
import {CasinoState, playSpin, SpinOutcome} from '../utils/casino/engine'
import {SymbolSet} from '../utils/casino/config'
import {renderSpinGif} from '../utils/casino/render'


export interface PreparedSpin {
    outcome: SpinOutcome
    gif: Buffer
    durationMs: number
}

interface CacheEntry {
    createdAt: number
    serverId: Snowflake
    spin: Promise<PreparedSpin>
}

const PREPARED_TTL: number = 30 * 60 * 1000
const cache: Map<string, CacheEntry> = new Map()

// Исход считается на состоянии игрока в момент подготовки — то же самое,
// что получилось бы при обычном спине сразу после предыдущего
export async function createPreparedSpin(symbols: SymbolSet, state: CasinoState, bet: number): Promise<PreparedSpin> {
    const outcome: SpinOutcome = playSpin(symbols, state, bet)
    const {buffer, durationMs} = await renderSpinGif(symbols, outcome.grid, outcome.combinations)

    return {outcome, gif: buffer, durationMs}
}

// Гифку следующего спина рендерим заранее, пока игрок смотрит текущую
export function ensurePreparedSpin(
    messageId: Snowflake,
    serverId: Snowflake,
    symbols: SymbolSet,
    state: CasinoState,
    bet: number
): void {
    const key: string = messageId
    if (cache.has(key)) {
        return
    }

    const spin: Promise<PreparedSpin> = createPreparedSpin(symbols, {
        bankSpent: state.bankSpent,
        bankWon: state.bankWon,
        dryStreak: state.dryStreak,
    }, bet)

    // Отдельная подписка нужна, чтобы отказ не всплыл как необработанный,
    // пока спин лежит в кэше и его никто не ждёт
    spin.catch((error: unknown) => {
        console.error('Не удалось подготовить спин заранее:', error)
        cache.delete(key)
    })

    cache.set(key, {createdAt: Date.now(), serverId, spin})
}

export function takePreparedSpin(messageId: Snowflake): Promise<PreparedSpin>|null {
    const key: string = messageId
    const entry: CacheEntry|undefined = cache.get(key)
    if (!entry) {
        return null
    }

    cache.delete(key)
    return entry.spin
}

// Символы сервера изменились — заранее отрисованные гифки показывают старые картинки
export function dropPreparedSpins(serverId: Snowflake): void {
    for (const [key, entry] of cache.entries()) {
        if (entry.serverId === serverId) {
            cache.delete(key)
        }
    }
}

setInterval(() => {
    const now: number = Date.now()
    for (const [key, entry] of cache.entries()) {
        if (now - entry.createdAt > PREPARED_TTL) {
            cache.delete(key)
        }
    }
}, 60 * 1000)
