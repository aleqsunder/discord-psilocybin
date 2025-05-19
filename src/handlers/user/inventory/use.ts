import {ChatInputCommandInteraction} from 'discord.js'
import {AbstractEffect} from '../../../effects/abstractEffect'
import InventoryItemRepository from '../../../repositories/InventoryItemRepository'
import {InventoryItem} from '../../../entities/psilocybin/InventoryItem'

export async function useItemInInventoryHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const effectItemId: string = interaction.options.getString('effect-item', true)
    const inventoryItem: InventoryItem|null = await InventoryItemRepository.findOne({
        where: {id: Number(effectItemId)},
        relations: ['item', 'item.group']
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
    }
}
