import {SlashCommandBuilder} from 'discord.js'

export const play = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Включение музыки в войсе')
    .addStringOption(option =>
        option
            .setName('song')
            .setDescription('Название музыки (по умолчанию Youtube, можно выбрать в [platform]) или ссылка на неё')
            .setAutocomplete(true)
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('platform')
            .setDescription('Выберите платформу')
            .addChoices(
                {name: 'YouTube', value: 'youtube'},
                {name: 'SoundCloud', value: 'soundcloud'},
                {name: 'Прямая ссылка', value: 'direct'}
            )
    )
