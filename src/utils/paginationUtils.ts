import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from 'discord.js'
import {SKRSContext2D} from '@napi-rs/canvas'

export function truncateTextWithEllipsis(
	ctx: SKRSContext2D,
	text: string,
	maxWidth: number,
	ellipsis: string = '...'
): string {
	if (ctx.measureText(text).width <= maxWidth) {
		return text
	}

	let truncatedText = text
	while (ctx.measureText(truncatedText + ellipsis).width > maxWidth && truncatedText.length > 0) {
		truncatedText = truncatedText.slice(0, -1)
	}

	return truncatedText + ellipsis
}

export function generatePagination(currentPage: number, totalPages: number): PaginationItem[] {
	const pagination: PaginationItem[] = []
	if (totalPages === 1) {
		return pagination
	}

	pagination.push(1)
	for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
		pagination.push(i)
	}

	if (totalPages > 1) {
		pagination.push(totalPages)
	}

	return pagination
}

export function generatePaginationButtons(page: number, path: string, pages: PaginationItem[]): ButtonBuilder[] {
	const buttons: ButtonBuilder[] = []

	for (const pageItem of pages) {
		const style = pageItem === page ? ButtonStyle.Primary : ButtonStyle.Secondary
		const pageButton: ButtonBuilder = new ButtonBuilder()
			.setCustomId(`${path}:${pageItem}`)
			.setLabel(String(pageItem))
			.setDisabled(typeof pageItem !== 'number')
			.setStyle(style)

		buttons.push(pageButton)
	}

	return buttons
}

export function formatPaginateButtons(page: number, pages: number, path: string): ActionRowBuilder<ButtonBuilder> {
	const paginate: PaginationItem[] = generatePagination(page, pages)
	const buttons: ButtonBuilder[] = generatePaginationButtons(page, path, paginate)

	return new ActionRowBuilder<ButtonBuilder>()
		.addComponents(...buttons)
}
