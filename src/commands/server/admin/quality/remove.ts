import {SlashCommandSubcommandBuilder} from 'discord.js'

export const qualityRemove: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('remove')
    .setDescription('Удаление качества')
    .addNumberOption(option =>
        option
            .setName('quality')
            .setDescription('Качество')
            .setRequired(true)
            .setAutocomplete(true)
    )
