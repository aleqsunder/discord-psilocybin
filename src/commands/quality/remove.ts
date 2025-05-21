import {SlashCommandSubcommandBuilder} from 'discord.js'

export const remove: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('remove')
    .setDescription('[Администратор] Удаляет качество')
    .addStringOption(option =>
        option
            .setName('quality')
            .setDescription('Качество')
            .setRequired(true)
            .setAutocomplete(true)
    )
