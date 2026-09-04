import {SlashCommandSubcommandBuilder} from 'discord.js'

export const create: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('create')
    .setDescription('Создать промокод, списав поинты с вашего баланса')
