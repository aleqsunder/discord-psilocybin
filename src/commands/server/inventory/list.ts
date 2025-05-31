import {SlashCommandSubcommandBuilder} from 'discord.js'

export const list: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('list')
    .setDescription('Показать список предметов в инвентаре')
    .addNumberOption(option =>
        option
            .setName('page')
            .setDescription('Страница')
    )
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('Инвентарь пользователя')
    )
