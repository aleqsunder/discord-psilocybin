import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ChatInputCommandInteraction, InteractionReplyOptions, InteractionUpdateOptions
} from 'discord.js'
import ItemRepository, {ItemRepositoryFilter} from '../../repositories/ItemRepository'
import {Item} from '../../entities/psilocybin/Item'
import {defaultListImageConfig, listItemsToAttachment} from '../../utils/inventoryUtils'
import {formatPaginateButtons} from '../../utils/paginationUtils'

export async function formatItemListPageAction(interaction: ChatInputCommandInteraction|ButtonInteraction, path: string, page: number = 1) {
	const filter: ItemRepositoryFilter = {
		serverId: interaction.guildId
	}

	const count: number = await ItemRepository.getListCount(filter)
	if (count === 0) {
		await interaction.reply(`Список предметов сервера пуст`)
		return
	}

	const {rows, itemsInRow} = defaultListImageConfig
	const countPerPage: number = rows * itemsInRow
	const pages: number = Math.ceil(count / countPerPage)

	if (page > pages) {
		await interaction.reply(`Страница ${page} не входит в диапазон страниц от 1 до ${pages}`)
		return
	}

	const items: Item[] = await ItemRepository.getList(page, countPerPage, filter)
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
		await interaction.reply(options)
	}
}

export async function listItemHandler(interaction: ChatInputCommandInteraction): Promise<void> {
	const page: number = interaction.options.getNumber('page') ?? 1
	await formatItemListPageAction(interaction, 'item:list', page)
}
