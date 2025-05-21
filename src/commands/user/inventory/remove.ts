import {SlashCommandSubcommandBuilder} from 'discord.js'

export const remove: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('remove')
    .setDescription('[Администратор] Удалить предмет из инвентаря пользователя')
    .addUserOption(option =>
        option
            .setName('user')
            .setRequired(true)
            .setDescription('Пользователь')
    )
    .addStringOption(option =>
        option
            .setName('user-item')
            .setDescription('Предмет')
            .setRequired(true)
            .setAutocomplete(true)
    )
