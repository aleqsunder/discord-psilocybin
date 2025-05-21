import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ChatInputCommandInteraction, InteractionEditReplyOptions, InteractionUpdateOptions
} from 'discord.js'
import {defaultListImageConfig, listCasesToAttachment} from '../../utils/inventoryUtils'
import {formatPaginateButtons} from '../../utils/paginationUtils'
import {ItemGroup} from '../../entities/psilocybin/ItemGroup'
import ItemGroupRepository, {ItemGroupRepositoryFilter} from '../../repositories/ItemGroupRepository'

export async function formatCaseListPageAction(interaction: ChatInputCommandInteraction|ButtonInteraction, path: string, page: number = 1) {
    const filter: ItemGroupRepositoryFilter = {
        serverId: interaction.guildId
    }

    const count: number = await ItemGroupRepository.getListCount(filter)
    if (count === 0) {
        await interaction.editReply(`Список кейсов пуст`)
        return
    }

    const {rows, itemsInRow} = defaultListImageConfig
    const countPerPage: number = rows * itemsInRow
    const pages: number = Math.ceil(count / countPerPage)

    if (page > pages) {
        await interaction.editReply(`Страница ${page} не входит в диапазон страниц от 1 до ${pages}`)
        return
    }

    const cases: ItemGroup[] = await ItemGroupRepository.getList(page, countPerPage, filter)
    const attachment: AttachmentBuilder = await listCasesToAttachment(cases)
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
        await interaction.editReply(options)
    }
}

export async function listCaseHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const page: number = interaction.options.getNumber('page') ?? 1
    await formatCaseListPageAction(interaction, 'case:list', page)
}
