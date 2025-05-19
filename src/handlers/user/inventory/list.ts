import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ChatInputCommandInteraction,
    InteractionCallbackResponse,
    InteractionReplyOptions,
    InteractionUpdateOptions,
    User,
} from 'discord.js'
import {ItemRepositoryFilter} from '../../../repositories/ItemRepository'
import {Item} from '../../../entities/psilocybin/Item'
import {defaultListImageConfig, listItemsToAttachment} from '../../../utils/inventoryUtils'
import {formatPaginateButtons} from '../../../utils/paginationUtils'
import {PaginationType} from '../../../services/CacheService'
import PaginationCache from '../../../services/CacheService'
import {InventoryItem} from '../../../entities/psilocybin/InventoryItem'
import InventoryItemRepository from '../../../repositories/InventoryItemRepository'

export async function formatInventoryItemListPageAction(interaction: ChatInputCommandInteraction|ButtonInteraction, path: string, page: number = 1, user: User) {
    const userId: string = user.id
    const filter: ItemRepositoryFilter = {
        serverId: interaction.guildId,
        userId
    }

    const count: number = await InventoryItemRepository.getListCount(filter)
    if (count === 0) {
        await interaction.reply(`Инвентарь пользователя <@${userId}> пуст`)
        return
    }

    const {rows, itemsInRow} = defaultListImageConfig
    const countPerPage: number = rows * itemsInRow
    const pages: number = Math.ceil(count / countPerPage)

    if (page > pages) {
        await interaction.reply(`Страница ${page} не входит в диапазон страниц от 1 до ${pages}`)
        return
    }

    const inventoryItems: InventoryItem[] = await InventoryItemRepository.getList(page, countPerPage, filter)
    const items: Item[] = inventoryItems.map(inventoryItem => inventoryItem.item)
    const attachment: AttachmentBuilder = await listItemsToAttachment(items)
    let options: InteractionReplyOptions = {
        files: [attachment],
    }

    if (pages > 1) {
        const row: ActionRowBuilder<ButtonBuilder> = formatPaginateButtons(page, pages, path)
        options.components = [row]
    }

    if (interaction.isButton()) {
        await interaction.update(options as InteractionUpdateOptions)
    } else {
        const reply: InteractionCallbackResponse = await interaction.reply({...options, withResponse: true})
        if (!reply?.resource?.message) {
            return
        }

        PaginationCache.set(reply.resource.message.id, {
            type: PaginationType.INVENTORY,
            serverId: interaction.guildId!,
            createdAt: Date.now(),
            user,
        })
    }
}

export async function listItemHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    let user: User|null = interaction.options.getUser('user')
    if (!user) {
        user = interaction.user
    }

    const page: number = interaction.options.getNumber('page') ?? 1
    await formatInventoryItemListPageAction(interaction, 'inventory:list', page, user)
}
