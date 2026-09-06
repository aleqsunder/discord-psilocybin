import {SlashCommandSubcommandBuilder} from 'discord.js'

export const casinoList: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('list')
    .setDescription('Показать символы казино и их шансы')
    .addNumberOption(option =>
        option
            .setName('page')
            .setDescription('Страница')
            .setMinValue(1)
    )
