import {ChatInputCommandInteraction} from 'discord.js'
import {isAdmin} from '../utils/permissionUtils'
import {itemAdminHandler} from './item'
import {itemQualityAdminHandler} from './quality'
import {inventoryAdminHandler} from './inventory'
import {itemCaseAdminHandler} from './case'

export async function adminHandler(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply()
    if (!isAdmin(interaction)) {
        await interaction.editReply(`У вас недостаточно прав для выполнения данной команды`)
        return
    }

    const subcommandGroup: string|null = interaction.options.getSubcommandGroup()
    switch (subcommandGroup) {
        case 'item': return await itemAdminHandler(interaction)
        case 'quality': return await itemQualityAdminHandler(interaction)
        case 'inventory': return await inventoryAdminHandler(interaction)
        case 'case': return await itemCaseAdminHandler(interaction)
    }

    throw new Error(`Несуществующая админ-команда ${subcommandGroup}`)
}
