import {SlashCommandSubcommandBuilder} from 'discord.js'

export const use: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('use')
    .setDescription('Использовать предмет из инвентаря')
    .addStringOption(option =>
        option
            .setName('user-item')
            .setDescription('Предмет с эффектом')
            .setRequired(true)
            .setAutocomplete(true)
    )
