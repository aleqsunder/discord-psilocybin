import {Repository} from 'typeorm'
import {CasinoBank} from '../entities/psilocybin/CasinoBank'
import {Psilocybin} from '../database/psilocybin'
import {Snowflake} from 'discord.js'

class CasinoBankRepository extends Repository<CasinoBank> {
    async getOrCreate(serverId: Snowflake): Promise<CasinoBank> {
        const bank: CasinoBank|null = await this.findOneBy({serverId})
        if (bank) {
            return bank
        }

        const created = new CasinoBank()
        created.serverId = serverId
        await created.save()

        return created
    }
}

export default new CasinoBankRepository(CasinoBank, Psilocybin.createEntityManager())
