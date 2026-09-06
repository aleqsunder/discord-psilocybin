import {Repository} from 'typeorm'
import {CasinoPlayer} from '../entities/psilocybin/CasinoPlayer'
import {Psilocybin} from '../database/psilocybin'
import {Snowflake} from 'discord.js'

class CasinoPlayerRepository extends Repository<CasinoPlayer> {
    async getOrCreate(serverId: Snowflake, userId: Snowflake): Promise<CasinoPlayer> {
        const player: CasinoPlayer|null = await this.findOneBy({serverId, userId})
        if (player) {
            return player
        }

        const created = new CasinoPlayer()
        created.serverId = serverId
        created.userId = userId
        await created.save()

        return created
    }
}

export default new CasinoPlayerRepository(CasinoPlayer, Psilocybin.createEntityManager())
