import {SlashCommandBuilder} from 'discord.js'

export const test = new SlashCommandBuilder()
    .setName('test')
    .setDescription('[Администратор] Для тестов')
    .addStringOption(option =>
        option
            .setName('input')
            .setDescription('Название песни или ссылка на неё')
    )
    .toJSON()
