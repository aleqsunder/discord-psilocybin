import {ChatInputCommandInteraction, User} from 'discord.js'
import {InventoryItem} from '../../entities/psilocybin/InventoryItem'
import InventoryItemRepository from '../../repositories/InventoryItemRepository'
import {isAdmin} from '../../utils/permissionUtils'

export async function removeItemInInventoryHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const user: User = interaction.options.getUser('user', true)
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

    try {
        await inventoryItem.remove()
        await interaction.editReply('Предмет удалён из инвентаря')
    } catch (e) {
        console.log('Ошибка удаления предмета из инвентаря', e)
        await interaction.editReply('Не удалось удалить предмет из инвентаря')
    }
}
