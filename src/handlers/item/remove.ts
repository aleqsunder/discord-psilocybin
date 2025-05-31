import {ChatInputCommandInteraction} from 'discord.js'
import {Item} from '../../entities/psilocybin/Item'
import ItemRepository from '../../repositories/ItemRepository'

export async function removeItemHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const itemId: number = interaction.options.getNumber('item', true)
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
