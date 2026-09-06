import {ChatInputCommandInteraction} from 'discord.js'
import {buySpinsHandler} from './spin'

export async function casinoHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand: string = interaction.options.getSubcommand()
    switch (subcommand) {
        case 'spin': return await buySpinsHandler(interaction)
        default: throw new Error(`Подкоманда "${subcommand}" не найдена`)
    }
}
