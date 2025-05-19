import {Repository} from 'typeorm'
import {MuhomorUser} from '../entities/MuhomorUser'
import {Muhomor} from '../database/muhomor'
import {CommandInteraction, Snowflake} from 'discord.js'

class MuhomorUserRepository extends Repository<MuhomorUser> {
	async getUserById(userId: Snowflake, guildId: Snowflake): Promise<MuhomorUser|null> {
        return this.findOneBy({userid: userId, guildid: guildId})
    }

    async getCurrentUser(interaction: CommandInteraction): Promise<MuhomorUser> {
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
