import {
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Interaction,
} from 'discord.js'
import {helpHandler} from "../handlers/helpHandler"
import {autocompleteHandler} from '../handlers/autocompleteHandler'
import {itemHandler} from '../handlers/item'
import {itemQualityHandler} from '../handlers/quality'
import {itemCaseHandler} from '../handlers/case'
import {buttonHandler} from '../handlers/buttonHandler'
import {userHandler} from '../handlers/user'
import {testHandler} from '../handlers/test'
import musicHandler from '../handlers/music'
import process from 'process'
import {isAdmin} from '../utils/permissionUtils'
import {openRandomCaseHandler} from '../handlers/case/openCase'

export async function interactionCreateHandler(interaction: Interaction): Promise<void> {
    const PSILOCYBIN_AVAILABLE_TO_USE_DEFAULT_USERS: boolean = process.env.PSILOCYBIN_AVAILABLE_TO_USE_DEFAULT_USERS === 'true'
    if (!PSILOCYBIN_AVAILABLE_TO_USE_DEFAULT_USERS && !isAdmin(interaction)) {
        await (interaction as ChatInputCommandInteraction).reply('Бот в режиме администратора!')
        return
    }

    if (!interaction.isCommand() && !interaction.isAutocomplete() && !interaction.isButton()) {
        return
    }

    try {
        if (!interaction.inGuild()) {
            // для обменника (на будущее)
        }

        if (interaction.isAutocomplete()) {
            return await autocompleteHandler(interaction as AutocompleteInteraction)
        }

        if (interaction.isButton()) {
            return await buttonHandler(interaction as ButtonInteraction)
        }

        interaction = interaction as ChatInputCommandInteraction
        switch (interaction.commandName) {
            case 'help': return await helpHandler(interaction)
            case 'item': return await itemHandler(interaction)
            case 'quality': return await itemQualityHandler(interaction)
            case 'user': return await userHandler(interaction)
            case 'test': return await testHandler(interaction)
            case 'play': return await musicHandler(interaction)

            case 'case': return await itemCaseHandler(interaction)
            case 'random-case': return await openRandomCaseHandler(interaction)
        }

        new Error(`Несуществующая команда ${interaction.commandName}`)
    } catch (e) {
        console.error(e)
    }
}
