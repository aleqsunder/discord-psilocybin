import {SlashCommandBuilder} from 'discord.js'

export const randomCaseShortcut = new SlashCommandBuilder()
    .setName('random-case')
    .setDescription('Открытие случайного кейса')
    .addNumberOption(option =>
        option
            .setName('count')
            .setDescription('Количество кейсов за раз')
            .setMinValue(1)
            .setMaxValue(10)
    )
    .toJSON()
