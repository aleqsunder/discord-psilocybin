import {
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Interaction,
    UserContextMenuCommandInteraction
} from 'discord.js'
import {helpHandler} from "../handlers/helpHandler"
import {autocompleteHandler} from '../handlers/autocompleteHandler'
import {itemHandler} from '../handlers/item'
import {itemCaseHandler} from '../handlers/case'
import {buttonHandler} from '../handlers/buttonHandler'
import {musicHandler} from '../handlers/music'
import {isAdmin} from '../utils/permissionUtils'
import {openRandomCaseHandler} from '../handlers/case/openCase'
import {inventoryHandler} from '../handlers/inventory'
import {adminHandler} from '../handlers/adminHandler'
import {settingsAdminHandler} from '../handlers/settingsHandler'
import {Setting} from '../entities/psilocybin/Setting'
import SettingRepository from '../repositories/SettingRepository'
import {userContextMenuHandler} from '../handlers/userContextMenu'

export async function interactionCreateHandler(interaction: Interaction): Promise<void> {
    const setting: Setting = await SettingRepository.getCurrentSetting(interaction)
    if (!setting.availableToUse && !isAdmin(interaction)) {
        if (interaction instanceof AutocompleteInteraction) {
            await interaction.respond([])
            return
        }

        await (interaction as ChatInputCommandInteraction).reply('Бот в режиме администратора!')
        return
    }

    if (
        !interaction.isCommand()
        && !interaction.isAutocomplete()
        && !interaction.isButton()
        && !interaction.isUserContextMenuCommand()
    ) {
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

        if (interaction.isUserContextMenuCommand()) {
            return await userContextMenuHandler(interaction as UserContextMenuCommandInteraction)
        }

        interaction = interaction as ChatInputCommandInteraction

        switch (interaction.commandName) {
            case 'admin':return await adminHandler(interaction)
            case 'settings': return await settingsAdminHandler(interaction)
            case 'help': return await helpHandler(interaction)
            case 'item': return await itemHandler(interaction)
            case 'inventory': return await inventoryHandler(interaction)
            case 'play': return await musicHandler(interaction)
            case 'case': return await itemCaseHandler(interaction)
            case 'random-case': return await openRandomCaseHandler(interaction)
        }

        throw new Error(`Несуществующая команда ${interaction.commandName}`)
    } catch (e) {
        console.error(e)
    }
}
