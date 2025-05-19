import {Snowflake} from 'discord.js'
import {Inventory} from '../entities/psilocybin/Inventory'

export default class InventoryService {
    public static async createNewInventory(userId: Snowflake, serverId: SnowflakeOrNull): Promise<Inventory> {
        if (!serverId) {
            throw new Error('Невозможно создать инвентарь, не будучи на сервере. Инвентарь пользователя на каждом сервере уникальный')
        }

        const inventory: Inventory = new Inventory()
        inventory.userId = userId
        inventory.serverId = serverId

        await inventory.save()
        return inventory
    }
}
