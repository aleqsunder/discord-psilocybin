import {SlashCommandSubcommandBuilder} from 'discord.js'

export const use: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('use')
    .setDescription('Использовать предмет из инвентаря')
    .addNumberOption(option =>
        option
            .setName('effect-item')
            .setDescription('Предмет с эффектом')
            .setRequired(true)
            .setAutocomplete(true)
    )
