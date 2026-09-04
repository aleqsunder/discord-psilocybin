import {SlashCommandBuilder} from 'discord.js'
import {create} from './create'
import {receive} from './receive'
import {list} from './list'

export const promo = new SlashCommandBuilder()
    .setName('promo')
    .setDescription('Команды для взаимодействия с промокодами')
    .addSubcommand(create)
    .addSubcommand(receive)
    .addSubcommand(list)
