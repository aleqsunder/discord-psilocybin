import {ChatInputCommandInteraction, User} from 'discord.js'
import {InventoryItem} from '../../../entities/psilocybin/InventoryItem'
import InventoryItemRepository from '../../../repositories/InventoryItemRepository'
import {ItemQuality} from '../../../entities/psilocybin/ItemQuality'
import {MuhomorUser} from '../../../entities/MuhomorUser'
import MuhomorUserRepository from '../../../repositories/MuhomorUserRepository'

export async function sellItemInInventoryHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()

    const user: User = interaction.user
    const userItemId: string = interaction.options.getString('user-item', true)
    const inventoryItem: InventoryItem|null = await InventoryItemRepository.getOneByFilter({
        id: Number(userItemId),
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
        const sellCost: number = quality.sellCost ?? 100
        const muhomorUser: MuhomorUser = await MuhomorUserRepository.getCurrentUser(interaction)
        muhomorUser.points += sellCost

        await muhomorUser.save()
        await inventoryItem.remove()

        await interaction.editReply(`Предмет продан!`)
    } catch (e) {
        console.log(e)
        await interaction.editReply(`Предмет не получилось продать`)
    }
}
