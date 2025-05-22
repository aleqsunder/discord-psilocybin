import {SlashCommandSubcommandBuilder} from 'discord.js'

export const add: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('add')
    .setDescription('[Администратор] Добавить предмет в инвентарь пользователя')
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('Пользователь')
            .setRequired(true)
    )
    .addNumberOption(option =>
        option
            .setName('item')
            .setDescription('Предмет')
            .setRequired(true)
            .setAutocomplete(true)
    )
