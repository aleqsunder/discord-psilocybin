import {ChatInputCommandInteraction, User} from 'discord.js'
import {InventoryItem} from '../../../entities/psilocybin/InventoryItem'
import InventoryItemRepository from '../../../repositories/InventoryItemRepository'
import {isAdmin} from '../../../utils/permissionUtils'

export async function removeItemInInventoryHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()

    if (!isAdmin(interaction)) {
        await interaction.editReply(`У вас недостаточно прав для выполнения данной команды`)
        return
    }

    const user: User = interaction.options.getUser('user', true)
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

    try {
        await inventoryItem.remove()
        await interaction.editReply('Предмет удалён из инвентаря')
    } catch (e) {
        console.log('Ошибка удаления предмета из инвентаря', e)
        await interaction.editReply('Не удалось удалить предмет из инвентаря')
    }
}
