import {SlashCommandBuilder} from 'discord.js'

export const test = new SlashCommandBuilder()
    .setName('test')
    .setDescription('[Администратор] Для тестов')
    .toJSON()
