import {ChatInputCommandInteraction} from 'discord.js'
import {AbstractEffect} from '../../../effects/abstractEffect'
import InventoryItemRepository from '../../../repositories/InventoryItemRepository'
import {InventoryItem} from '../../../entities/psilocybin/InventoryItem'

export async function useItemInInventoryHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const effectItemId: string = interaction.options.getString('user-item', true)
    const inventoryItem: InventoryItem|null = await InventoryItemRepository.getOneByFilter({
        id: Number(effectItemId),
        serverId: interaction.guildId!,
    })

    if (!inventoryItem) {
        await interaction.reply(`Предмета в инвентаре не существует`)
        return
    }

    const effect: AbstractEffect|null = inventoryItem.item.getEffect()
    if (!effect) {
        await interaction.reply(`У данного предмета нет эффекта`)
        return
    }

    try {
        await effect.onEffect(interaction, inventoryItem, inventoryItem.item.group)
        await effect.onDelete(interaction, inventoryItem)
    } catch (e) {
        console.log('Ошибка выполнения эффекта', e)

        if (interaction.replied) {
            await interaction.editReply('Не удалось выполнить эффект')
        } else {
            await interaction.reply('Не удалось выполнить эффект')
        }
    }
}
