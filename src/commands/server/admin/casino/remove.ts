import {SlashCommandSubcommandBuilder} from 'discord.js'

export const casinoRemove: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('remove')
    .setDescription('Удалить символ из казино')
    .addNumberOption(option =>
        option
            .setName('casino-symbol')
            .setDescription('Символ казино')
            .setRequired(true)
            .setAutocomplete(true)
    )
