import {ContextMenuCommandBuilder, ApplicationCommandType} from 'discord.js'

export const showUserInventory = new ContextMenuCommandBuilder()
    .setName("Показать инвентарь пользователя")
    .setType(ApplicationCommandType.User)
