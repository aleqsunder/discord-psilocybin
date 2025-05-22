import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder, ButtonInteraction,
    ChatInputCommandInteraction, InteractionEditReplyOptions,
    InteractionUpdateOptions, Message
} from 'discord.js'
import {ItemGroup} from '../../entities/psilocybin/ItemGroup'
import ItemGroupRepository from '../../repositories/ItemGroupRepository'
import {Item} from '../../entities/psilocybin/Item'
import {defaultListImageConfig, listItemsToAttachment} from '../../utils/inventoryUtils'
import {formatPaginateButtons} from '../../utils/paginationUtils'
import PaginationCache, {PaginationType} from '../../services/CacheService'

export async function formatCasePageAction(
    interaction: ChatInputCommandInteraction|ButtonInteraction,
    path: string,
    caseEntity: ItemGroup,
    page: number = 1
): Promise<void> {
    if (caseEntity.serverId !== interaction.guildId) {
        await interaction.editReply(`Данный кейс используется на другом сервере`)
        return
    }

    const {rows, itemsInRow} = defaultListImageConfig
    const countPerPage: number = rows * itemsInRow

    const allItems: Item[] = caseEntity.items
    const count: number = allItems.length
    if (count === 0) {
        await interaction.editReply(`Данный кейс не содержит предметов`)
        return
    }

    const items: Item[] = allItems.slice((page - 1) * countPerPage, page * countPerPage)
    const attachment: AttachmentBuilder = await listItemsToAttachment(items)
    let options: InteractionEditReplyOptions = {
        files: [attachment],
    }

    const pages: number = Math.ceil(count / countPerPage)
    if (page > pages) {
        await interaction.editReply(`Страница ${page} не входит в диапазон страниц от 1 до ${pages}`)
        return
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
            type: PaginationType.CASE_ITEM,
            serverId: interaction.guildId!,
            createdAt: Date.now(),
            author: interaction.user!,
            caseEntity,
        })
    }
}

export async function showCaseHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const page: number = interaction.options.getNumber('page') ?? 1
    const caseId: number = interaction.options.getNumber('case', true)
    const caseEntity: ItemGroup|null = await ItemGroupRepository.findOne({
        where: {
            id: caseId,
            serverId: interaction.guildId!,
        },
        relations: ['items', 'items.quality']
    })

    if (!caseEntity) {
        await interaction.editReply(`Кейс не найден`)
        return
    }

    await formatCasePageAction(interaction, 'case:item', caseEntity, page)
}
