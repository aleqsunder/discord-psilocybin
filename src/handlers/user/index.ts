import {ChatInputCommandInteraction} from 'discord.js'
import {inventoryHandler} from './inventory'

export async function userHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommandGroup: string|null = interaction.options.getSubcommandGroup()
    switch (subcommandGroup) {
        case 'inventory':
            return await inventoryHandler(interaction)
        default:
            throw new Error(`Подкоманда "${subcommandGroup}" не найдена`)
    }
}
