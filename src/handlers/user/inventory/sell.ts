import {ChatInputCommandInteraction, User} from 'discord.js'
import {InventoryItem} from '../../../entities/psilocybin/InventoryItem'
import InventoryItemRepository from '../../../repositories/InventoryItemRepository'
import {ItemQuality} from '../../../entities/psilocybin/ItemQuality'
import {MuhomorUser} from '../../../entities/MuhomorUser'
import MuhomorUserRepository from '../../../repositories/MuhomorUserRepository'
import {formatMoney} from '../../../utils/formatUtils'

async function sellOneItemInInventory(inventoryItem: InventoryItem, interaction: ChatInputCommandInteraction): Promise<void> {
    const quality: ItemQuality = inventoryItem.item.quality!
    const sellCost: number = quality.sellCost
    await inventoryItem.remove()

    const muhomorUser: MuhomorUser = await MuhomorUserRepository.getCurrentUser(interaction)
    muhomorUser.points = formatMoney(muhomorUser.points + sellCost)
    await muhomorUser.save()

    await interaction.editReply(`Предмет продан за ${quality.sellCost} поинтов! Ваш баланс - ${muhomorUser.points}!`)
}

async function bulkSellItemInInventory(inventoryItem: InventoryItem, interaction: ChatInputCommandInteraction): Promise<void> {
    const quality: ItemQuality = inventoryItem.item.quality!
    const user: User = interaction.user
    const itemId: number = inventoryItem.itemId
    const inventoryItems: InventoryItem[] = await InventoryItemRepository.find({
        where: {
            item: {
                id: itemId,
                serverId: interaction.guildId!,
            },
            inventory: {
                userId: user.id
            }
        }
    })

    const countItems: number = inventoryItems.length
    if (countItems === 0) {
        throw new Error('Предмет не удалось продать')
    }

    const sellCost: number = quality.sellCost * countItems

    inventoryItems.forEach((inventoryItem: InventoryItem) => {
        inventoryItem.remove()
    })

    const muhomorUser: MuhomorUser = await MuhomorUserRepository.getCurrentUser(interaction)
    muhomorUser.points = formatMoney(muhomorUser.points + sellCost)
    await muhomorUser.save()

    await interaction.editReply(`Предметы в количестве ${countItems} штук были проданы в общей сложности за ${sellCost} поинтов!\nВаш баланс: ${muhomorUser.points}`)
}

export async function sellItemInInventoryHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()
    const user: User = interaction.user
    const userItemId: number = interaction.options.getNumber('user-item', true)
    const inventoryItem: InventoryItem|null = await InventoryItemRepository.getOneByFilter({
        id: userItemId,
        userId: user.id,
        serverId: interaction.guildId!,
    })

    if (!inventoryItem) {
        await interaction.editReply(`Предмета в инвентаре не существует`)
        return
    }

    const quality: ItemQuality|null = inventoryItem.item.quality
    if (!quality) {
        await interaction.editReply(`У предмета отсутствует качество`)
        return
    }

    try {
        const isBulk: boolean = interaction.options.getBoolean('bulk') ?? false
        if (!isBulk) {
            await sellOneItemInInventory(inventoryItem, interaction)
        } else {
            await bulkSellItemInInventory(inventoryItem, interaction)
        }
    } catch (e) {
        console.log(e)
        await interaction.editReply(`Предмет не получилось продать`)
    }
}
