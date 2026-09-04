import {ChatInputCommandInteraction} from 'discord.js'
import {createPromocodeHandler} from './create'
import {receivePromocodeHandler} from './receive'
import {listPromocodeHandler} from './list'

export async function promoHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand: string = interaction.options.getSubcommand()
    switch (subcommand) {
        case 'create': return await createPromocodeHandler(interaction)
        case 'receive': return await receivePromocodeHandler(interaction)
        case 'list': return await listPromocodeHandler(interaction)
        default: throw new Error(`Подкоманда "${subcommand}" не найдена`)
    }
}
