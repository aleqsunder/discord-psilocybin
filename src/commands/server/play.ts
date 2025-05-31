import {SlashCommandBuilder} from 'discord.js'

export const play = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Включение музыки в войсе')
    .addStringOption(option =>
        option
            .setName('input')
            .setDescription('Название музыки или ссылка на неё (поддерживается YouTube, SoundCloud или прямые ссылки)')
    )
