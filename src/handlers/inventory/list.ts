import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ChatInputCommandInteraction,
    InteractionEditReplyOptions,
    InteractionUpdateOptions, Message,
    User, UserContextMenuCommandInteraction,
} from 'discord.js'
import {ItemRepositoryFilter} from '../../repositories/ItemRepository'
import {Item} from '../../entities/psilocybin/Item'
import {defaultListImageConfig, listItemsToAttachment} from '../../utils/inventoryUtils'
import {formatPaginateButtons} from '../../utils/paginationUtils'
import {PaginationType} from '../../services/CacheService'
import PaginationCache from '../../services/CacheService'
import {InventoryItem} from '../../entities/psilocybin/InventoryItem'
import InventoryItemRepository from '../../repositories/InventoryItemRepository'

export async function formatInventoryItemListPageAction(interaction: ChatInputCommandInteraction|ButtonInteraction|UserContextMenuCommandInteraction, path: string, page: number = 1, user: User) {
    const userId: string = user.id
    const filter: ItemRepositoryFilter = {
        serverId: interaction.guildId,
        userId
    }

    const count: number = await InventoryItemRepository.getListCount(filter)
    if (count === 0) {
        await interaction.editReply(`Инвентарь пользователя <@${userId}> пуст`)
        return
    }

    const {rows, itemsInRow} = defaultListImageConfig
    const countPerPage: number = rows * itemsInRow
    const pages: number = Math.ceil(count / countPerPage)

    if (page > pages) {
        await interaction.editReply(`Страница ${page} не входит в диапазон страниц от 1 до ${pages}`)
        return
    }

    const inventoryItems: InventoryItem[] = await InventoryItemRepository.getList(page, countPerPage, filter)
    const items: Item[] = inventoryItems.map(inventoryItem => inventoryItem.item)
    const attachment: AttachmentBuilder = await listItemsToAttachment(items)
    let options: InteractionEditReplyOptions = {
        files: [attachment],
    }

    if (pages > 1) {
        const row: ActionRowBuilder<ButtonBuilder> = formatPaginateButtons(page, pages, path)
        options.components = [row]
    }

    if (interaction.isButton()) {
        await interaction.update(options as InteractionUpdateOptions)
    } else {
        const reply: Message = await interaction.editReply(options)

        PaginationCache.set(reply.id, {
            type: PaginationType.INVENTORY,
            serverId: interaction.guildId!,
            createdAt: Date.now(),
            author: interaction.user!,
            user,
        })
    }
}

export async function listUserItemsHandler(interaction: UserContextMenuCommandInteraction): Promise<void> {
    let user: User = interaction.targetUser
    await formatInventoryItemListPageAction(interaction, 'inventory:list', 1, user)
}

export async function listItemHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()

    let user: User|null = interaction.options.getUser('user')
    if (!user) {
        user = interaction.user
    }

    const page: number = interaction.options.getNumber('page') ?? 1
    await formatInventoryItemListPageAction(interaction, 'inventory:list', page, user)
}
