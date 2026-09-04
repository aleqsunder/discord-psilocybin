import {IsNull, Repository, UpdateResult} from 'typeorm'
import {Promocode} from '../entities/psilocybin/Promocode'
import {Psilocybin} from '../database/psilocybin'
import {Snowflake} from 'discord.js'

class PromocodeRepository extends Repository<Promocode> {
    getOneByCode(code: string, serverId: Snowflake): Promise<Promocode|null> {
        return this.findOneBy({code, serverId})
    }

    getListByCreator(creatorId: Snowflake, serverId: Snowflake): Promise<Promocode[]> {
        return this.find({
            where: {creatorId, serverId},
            order: {createdAt: 'DESC'},
        })
    }

    async activate(promocode: Promocode, userId: Snowflake): Promise<boolean> {
        const activatedAt: number = Date.now()
        const {affected}: UpdateResult = await this.update(
            {id: promocode.id, activatedById: IsNull()},
            {activatedById: userId, activatedAt},
        )

        if (!affected) {
            return false
        }

        promocode.activatedById = userId
        promocode.activatedAt = activatedAt

        return true
    }
}

export default new PromocodeRepository(Promocode, Psilocybin.createEntityManager())
