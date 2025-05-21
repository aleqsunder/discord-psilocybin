import {ChatInputCommandInteraction} from 'discord.js'
import {isAdmin} from '../../utils/permissionUtils'
import {Item} from '../../entities/psilocybin/Item'
import ItemRepository from '../../repositories/ItemRepository'

export async function removeItemHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!isAdmin(interaction)) {
        await interaction.editReply(`У вас недостаточно прав для выполнения данной команды`)
        return
    }

    const itemId: string = interaction.options.getString('item', true)
    const item: Item|null = await ItemRepository.findOneBy({
        id: Number(itemId),
        serverId: interaction.guildId!,
    })

    if (!item) {
        await interaction.editReply(`Предмет не существует`)
        return
    }

    try {
        await item.remove()
        await interaction.editReply('Предмет удалён')
    } catch (e) {
        console.log(e)
        await interaction.editReply('Не удалось удалить предмет')
    }
}
