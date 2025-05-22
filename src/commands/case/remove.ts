import {SlashCommandSubcommandBuilder} from 'discord.js'

export const remove: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('remove')
    .setDescription('Удаление кейса')
    .addNumberOption(option =>
        option
            .setName('case')
            .setDescription('Кейс')
            .setRequired(true)
            .setAutocomplete(true)
    )
