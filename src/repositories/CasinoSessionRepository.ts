import {Repository} from 'typeorm'
import {CasinoSession} from '../entities/psilocybin/CasinoSession'
import {Psilocybin} from '../database/psilocybin'
import {Snowflake} from 'discord.js'

class CasinoSessionRepository extends Repository<CasinoSession> {
    getByMessageId(messageId: Snowflake): Promise<CasinoSession|null> {
        return this.findOneBy({messageId})
    }
}

export default new CasinoSessionRepository(CasinoSession, Psilocybin.createEntityManager())
