import {SlashCommandSubcommandBuilder} from 'discord.js'

export const casinoAdd: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('add')
    .setDescription('Добавить символ в казино')
    .addStringOption(option =>
        option
            .setName('name')
            .setDescription('Название символа')
            .setRequired(true)
            .setMaxLength(50)
    )
    .addAttachmentOption(option =>
        option
            .setName('image')
            .setDescription('Картинка символа')
            .setRequired(true)
    )
    .addNumberOption(option =>
        option
            .setName('weight')
            .setDescription('Вес выпадения: чем больше, тем чаще символ появляется')
            .setMinValue(0)
    )
    .addNumberOption(option =>
        option
            .setName('payout')
            .setDescription('Базовая выплата за комбинацию, в ставках')
            .setMinValue(0)
    )
