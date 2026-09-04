import {MoreThan, Repository} from 'typeorm'
import {MuhomorUser} from '../entities/MuhomorUser'
import {Muhomor} from '../database/muhomor'
import {Interaction, Snowflake} from 'discord.js'

class MuhomorUserRepository extends Repository<MuhomorUser> {
	async getUserById(userId: Snowflake, guildId: Snowflake): Promise<MuhomorUser|null> {
        return this.findOneBy({userid: userId, guildid: guildId})
    }

    getTopByPoints(guildId: Snowflake, limit: number): Promise<MuhomorUser[]> {
        return this.find({
            where: {guildid: guildId, points: MoreThan(0)},
            order: {points: 'DESC'},
            take: limit,
        })
    }

    async getCurrentUser(interaction: Interaction): Promise<MuhomorUser> {
        const {user: {id}, guildId} = interaction

        let user: MuhomorUser|null = await this.getUserById(id, guildId!)
        if (!user) {
            user = new MuhomorUser()
            user.guildid = guildId!
            user.userid = id

            await user.save()
        }

        return user
    }
}

export default new MuhomorUserRepository(MuhomorUser, Muhomor.createEntityManager())
