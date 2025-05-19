import {SlashCommandBuilder} from 'discord.js'
import {SlashCommandSubcommandGroupBuilder} from '@discordjs/builders'
import {list} from './inventory/list'
import {add} from './inventory/add'
import {remove} from './inventory/remove'
import {use} from './inventory/use'

export const user = new SlashCommandBuilder()
    .setName('user')
    .setDescription('Команды для взаимодействия с пользователями')
    .addSubcommandGroup((subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
        subcommandGroup
            .setName('inventory')
            .setDescription('Команды для взаимодействия с инвентарём пользователей')
            .addSubcommand(list)
            .addSubcommand(add)
            .addSubcommand(remove)
            .addSubcommand(use)
    )
    .toJSON()
