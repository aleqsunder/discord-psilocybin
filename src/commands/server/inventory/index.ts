import {SlashCommandBuilder} from 'discord.js'
import {list} from './list'
import {use} from './use'
import {sell} from './sell'

export const inventory = new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Команды для взаимодействия с инвентарём')
    .addSubcommand(list)
    .addSubcommand(use)
    .addSubcommand(sell)
