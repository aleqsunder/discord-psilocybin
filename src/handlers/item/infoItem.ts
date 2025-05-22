import {ChatInputCommandInteraction} from 'discord.js'
import {Item} from '../../entities/psilocybin/Item'
import ItemRepository from '../../repositories/ItemRepository'
import {generateInfoAttachment} from '../../utils/inventoryUtils'

export async function infoItemHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const itemId: number = interaction.options.getNumber('item', true)
    const item: Item|null = await ItemRepository.findOneBy({
        id: Number(itemId),
        serverId: interaction.guildId!,
    })

    if (!item) {
        await interaction.editReply(`Предмет не существует`)
        return
    }

    await generateInfoAttachment(item, interaction)
}
