import {SlashCommandSubcommandBuilder} from 'discord.js'

export const receive: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('receive')
    .setDescription('Активировать промокод и получить поинты')
