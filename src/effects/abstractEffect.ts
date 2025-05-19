import {ItemGroup} from '../entities/psilocybin/ItemGroup'
import {ChatInputCommandInteraction} from 'discord.js'
import {InventoryItem} from '../entities/psilocybin/InventoryItem'

export abstract class AbstractEffect {
    protected removeAfterUse: boolean = false

    protected name: string
    protected shortName: string
    protected description: string

    public abstract onEffect(interaction: ChatInputCommandInteraction, inventoryItem: InventoryItem, group: ItemGroup|null): Promise<void>

    async onDelete(interaction: ChatInputCommandInteraction, inventoryItem: InventoryItem): Promise<void> {
        if (this.removeAfterUse) {
            await inventoryItem.remove()
        }
    }

    public getRemoveAfterUse() {
        return this.removeAfterUse
    }

    public getName() {
        return this.name
    }

    public getShortName() {
        return this.shortName
    }

    public getDescription() {
        return this.description
    }
}
