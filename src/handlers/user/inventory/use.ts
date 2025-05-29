import {ChatInputCommandInteraction} from 'discord.js'
import {AbstractEffect} from '../../../effects/abstractEffect'
import InventoryItemRepository from '../../../repositories/InventoryItemRepository'
import {InventoryItem} from '../../../entities/psilocybin/InventoryItem'
import DefaultEffectError from '../../../errors/DefaultEffectError'

export async function useItemInInventoryHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const effectItemId: number = interaction.options.getNumber('effect-item', true)
    const inventoryItem: InventoryItem|null = await InventoryItemRepository.getOneByFilter({
        id: effectItemId,
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
        switch (true) {
            case e instanceof DefaultEffectError:
                if (interaction.replied) {
                    await interaction.editReply(e.message)
                } else {
                    await interaction.reply(e.message)
                }

                break
            default:
                console.error(e)
        }
    }
}
