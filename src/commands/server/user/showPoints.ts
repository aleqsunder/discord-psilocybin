import {ContextMenuCommandBuilder, ApplicationCommandType} from 'discord.js'

export const showUserPoints = new ContextMenuCommandBuilder()
    .setName("Показать баланс пользователя")
    .setType(ApplicationCommandType.User)
