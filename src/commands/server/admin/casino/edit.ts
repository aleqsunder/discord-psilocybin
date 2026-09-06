import {SlashCommandSubcommandBuilder} from 'discord.js'

export const casinoEdit: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('edit')
    .setDescription('Изменить символ казино')
    .addNumberOption(option =>
        option
            .setName('casino-symbol')
            .setDescription('Символ казино')
            .setRequired(true)
            .setAutocomplete(true)
    )
    .addStringOption(option =>
        option
            .setName('name')
            .setDescription('Новое название')
            .setMaxLength(50)
    )
    .addAttachmentOption(option =>
        option
            .setName('image')
            .setDescription('Новая картинка')
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
