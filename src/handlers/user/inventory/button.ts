import {ButtonInteraction, MessageFlagsBitField} from 'discord.js'
import {formatInventoryItemListPageAction} from './list'
import PaginationCache, {InventoryCache, PaginationCacheType} from '../../../services/CacheService'

async function itemListHandler(interaction: ButtonInteraction, option: string) {
    const messageId: string = interaction.message.id
    const cached: PaginationCacheType|undefined = PaginationCache.get(messageId) as InventoryCache
    if (!cached) {
        await interaction.reply({
            content: 'Данные о странице устарели',
            flags: MessageFlagsBitField.Flags.Ephemeral
        })

        return
    }

    const page: number = Number(option) ?? 1
    await formatInventoryItemListPageAction(interaction, 'inventory:list', page, cached.user)
}

export async function inventoryPaginationHandler(interaction: ButtonInteraction, subcommand: string, option: string) {
    switch (subcommand) {
        case 'list': return await itemListHandler(interaction, option)
        default: throw new Error(`Несуществующая сабкоманда ${subcommand} (button)`)
    }
}
