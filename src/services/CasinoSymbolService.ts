import {Snowflake} from 'discord.js'
import {CasinoSymbol} from '../entities/psilocybin/CasinoSymbol'
import CasinoSymbolRepository from '../repositories/CasinoSymbolRepository'
import {buildSymbolSet, DEFAULT_FRUITS, SpinSymbol, SymbolKind, SymbolSet} from '../utils/casino/config'
import {DEFAULT_CASINO_CATALOG} from '../constants'
import {dropPreparedSpins} from './CasinoSpinCache'

const cache: Map<Snowflake, SymbolSet> = new Map()

function toSpinSymbol(symbol: CasinoSymbol): SpinSymbol {
    return {
        id: String(symbol.id),
        name: symbol.name,
        imagePath: symbol.getImagePath(),
        kind: SymbolKind.FRUIT,
        weight: symbol.weight,
        payout: symbol.payout,
    }
}

// Новому серверу заводим стандартный набор фруктов, дальше его правит админ
async function createDefaultSymbols(serverId: Snowflake): Promise<CasinoSymbol[]> {
    const created: CasinoSymbol[] = []

    for (const fruit of DEFAULT_FRUITS) {
        const symbol = new CasinoSymbol()
        symbol.serverId = serverId
        symbol.name = fruit.name
        symbol.imagePath = `${DEFAULT_CASINO_CATALOG}/${fruit.image}`
        symbol.weight = fruit.weight
        symbol.payout = fruit.payout
        await symbol.save()

        created.push(symbol)
    }

    return created
}

export async function getSymbolSet(serverId: Snowflake): Promise<SymbolSet> {
    const cached: SymbolSet|undefined = cache.get(serverId)
    if (cached) {
        return cached
    }

    let symbols: CasinoSymbol[] = await CasinoSymbolRepository.getAllByServer(serverId)
    if (symbols.length === 0) {
        symbols = await createDefaultSymbols(serverId)
    }

    const symbolSet: SymbolSet = buildSymbolSet(symbols.map(toSpinSymbol))
    cache.set(serverId, symbolSet)

    return symbolSet
}

// После правок админа набор нужно перечитать, а заодно выбросить заранее отрисованные
// гифки: они нарисованы старыми картинками
export function invalidateSymbolSet(serverId: Snowflake): void {
    cache.delete(serverId)
    dropPreparedSpins(serverId)
}
