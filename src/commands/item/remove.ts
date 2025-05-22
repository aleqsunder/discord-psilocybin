import {SlashCommandSubcommandBuilder} from 'discord.js'

export const remove: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName("remove")
    .setDescription("[Администратор] Удалить предмет")
    .addNumberOption(option =>
        option
            .setName('item')
            .setDescription('Предмет')
            .setRequired(true)
            .setAutocomplete(true)
    )
