import {SlashCommandSubcommandBuilder} from 'discord.js'

export const itemRemove: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName("remove")
    .setDescription("Удаление предмета")
    .addNumberOption(option =>
        option
            .setName('item')
            .setDescription('Предмет')
            .setRequired(true)
            .setAutocomplete(true)
    )
