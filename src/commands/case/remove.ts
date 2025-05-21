import {SlashCommandSubcommandBuilder} from 'discord.js'

export const remove: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('remove')
    .setDescription('Удаление кейса')
    .addStringOption(option =>
        option
            .setName('case')
            .setDescription('Кейс')
            .setRequired(true)
            .setAutocomplete(true)
    )
