import {Repository} from 'typeorm'
import {Inventory} from '../entities/psilocybin/Inventory'
import {Psilocybin} from '../database/psilocybin'
import {CommandInteraction, Snowflake} from 'discord.js'
import InventoryService from '../services/InventoryService'

class InventoryRepository extends Repository<Inventory> {
    async getInventoryById(userId: Snowflake, serverId: Snowflake): Promise<Inventory|null> {
        return this.findOneBy({userId, serverId})
    }

    async getCurrentInventory(interaction: CommandInteraction): Promise<Inventory> {
        const {user: {id}, guildId} = interaction
        if (!id || !guildId) {
            throw new Error('Метод вызван вне контекста сервера')
        }

        let inventory: Inventory|null = await this.getInventoryById(id, guildId)
        if (!inventory) {
            inventory = await InventoryService.createNewInventory(id, guildId)
        }

        return inventory
    }
}

export default new InventoryRepository(Inventory, Psilocybin.createEntityManager())
