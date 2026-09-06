import {Repository, SelectQueryBuilder} from 'typeorm'
import {CasinoSymbol} from '../entities/psilocybin/CasinoSymbol'
import {Psilocybin} from '../database/psilocybin'
import {Snowflake} from 'discord.js'

export interface CasinoSymbolFilter {
    serverId?: SnowflakeOrNull
    name?: string
}

function filterSymbols(qb: SelectQueryBuilder<CasinoSymbol>, filter: CasinoSymbolFilter): SelectQueryBuilder<CasinoSymbol> {
    if (filter.serverId) {
        qb.andWhere('symbol.server_id = :serverId', {serverId: filter.serverId})
    }

    if (filter.name) {
        qb.andWhere('symbol.name LIKE :name', {name: `%${filter.name}%`})
    }

    return qb
}

class CasinoSymbolRepository extends Repository<CasinoSymbol> {
    getListBuilder(filter: CasinoSymbolFilter = {}): SelectQueryBuilder<CasinoSymbol> {
        return filterSymbols(this.createQueryBuilder('symbol'), filter).orderBy('symbol.weight', 'DESC')
    }

    getAllByServer(serverId: Snowflake): Promise<CasinoSymbol[]> {
        return this.getListBuilder({serverId}).getMany()
    }

    getList(page: number = 1, countPerPage: number = 10, filter: CasinoSymbolFilter = {}): Promise<CasinoSymbol[]> {
        return this.getListBuilder(filter)
            .skip((page - 1) * countPerPage)
            .take(countPerPage)
            .getMany()
    }

    async getListCount(filter: CasinoSymbolFilter = {}): Promise<number> {
        const {count = 0} = await this.getListBuilder(filter)
            .select('COUNT(symbol.id)', 'count')
            .getRawOne() as {count: number}

        return count
    }
}

export default new CasinoSymbolRepository(CasinoSymbol, Psilocybin.createEntityManager())
