import {SlashCommandBuilder} from 'discord.js'

export const points = new SlashCommandBuilder()
    .setName('points')
    .setDescription('Показывает количество поинтов')
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('Пользователь, чьи поинты нужно посмотреть')
    )
