import {SlashCommandSubcommandBuilder} from 'discord.js'

export const inventoryRemove: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('remove')
    .setDescription('[Администратор] Удалить предмет из инвентаря пользователя')
    .addUserOption(option =>
        option
            .setName('user')
            .setRequired(true)
            .setDescription('Пользователь')
    )
    .addNumberOption(option =>
        option
            .setName('user-item')
            .setDescription('Предмет')
            .setRequired(true)
            .setAutocomplete(true)
    )
