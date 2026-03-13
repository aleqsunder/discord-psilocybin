import {SlashCommandBuilder} from 'discord.js'

export const summary = new SlashCommandBuilder()
    .setName('summary')
    .setDescription('Краткая сводка последних сообщений в чате')
    .addStringOption(option =>
        option
            .setName('style')
            .setDescription('Стиль сводки')
            .addChoices(
                {name: 'Несерьёзный', value: 'frivolous'},
                {name: 'Серьёзный', value: 'serious'}
            )
    )
