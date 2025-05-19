import {ButtonInteraction} from 'discord.js'
import {formatItemListPageAction} from './list'

async function itemListHandler(interaction: ButtonInteraction, option: string) {
    const page: number = Number(option) ?? 1
    await formatItemListPageAction(interaction, 'item:list', page)
}

export async function itemPaginationHandler(interaction: ButtonInteraction, subcommand: string, option: string) {
    switch (subcommand) {
        case 'list': return await itemListHandler(interaction, option)
        default: throw new Error(`Несуществующая сабкоманда ${subcommand} (button)`)
    }
}
