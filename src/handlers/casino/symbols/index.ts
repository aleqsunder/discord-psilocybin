import {ChatInputCommandInteraction} from 'discord.js'
import {listCasinoSymbolsHandler} from './list'
import {createCasinoSymbolHandler} from './create'
import {editCasinoSymbolHandler} from './edit'
import {removeCasinoSymbolHandler} from './remove'

export async function casinoSymbolAdminHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand: string = interaction.options.getSubcommand()
    switch (subcommand) {
        case 'list': return await listCasinoSymbolsHandler(interaction)
        case 'add': return await createCasinoSymbolHandler(interaction)
        case 'edit': return await editCasinoSymbolHandler(interaction)
        case 'remove': return await removeCasinoSymbolHandler(interaction)
        default: throw new Error(`Подкоманда "${subcommand}" не найдена`)
    }
}
