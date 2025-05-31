import {SlashCommandSubcommandBuilder} from 'discord.js'

export const info: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('info')
    .setDescription('Информация о предмете')
    .addNumberOption(option =>
        option
            .setName('item')
            .setDescription('Предмет')
            .setRequired(true)
            .setAutocomplete(true)
    )
