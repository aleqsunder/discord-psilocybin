import {SlashCommandBuilder} from 'discord.js'
import {spin} from './spin'

export const casino = new SlashCommandBuilder()
    .setName('casino')
    .setDescription('Команды для взаимодействия с казино')
    .addSubcommand(spin)
