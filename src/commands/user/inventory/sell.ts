import {SlashCommandSubcommandBuilder} from 'discord.js'

export const sell: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('sell')
    .setDescription('Продать предмет из инвентаря')
    .addNumberOption(option =>
        option
            .setName('user-item')
            .setDescription('Предмет на продажу')
            .setRequired(true)
            .setAutocomplete(true)
    )
    .addBooleanOption(option =>
        option
            .setName('bulk')
            .setDescription('Продать все однотипные предметы разом')
    )
