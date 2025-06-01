import {PermissionFlagsBits, SlashCommandBuilder} from 'discord.js'
import {SlashCommandSubcommandGroupBuilder} from '@discordjs/builders'
import {caseCreate} from './case/create'
import {caseEdit} from './case/edit'
import {caseRemove} from './case/remove'
import {itemCreate} from './item/create'
import {itemEdit} from './item/edit'
import {itemRemove} from './item/remove'
import {qualityCreate} from './quality/create'
import {qualityEdit} from './quality/edit'
import {qualityRemove} from './quality/remove'
import {inventoryAdd} from './inventory/add'
import {inventoryRemove} from './inventory/remove'

export const admin = new SlashCommandBuilder()
    .setName("admin")
    .setDescription("[Администратор] Команды для администратора")
    .addSubcommandGroup((subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
        subcommandGroup
            .setName('case')
            .setDescription('Команды для редактирования кейсов')
            .addSubcommand(caseCreate)
            .addSubcommand(caseEdit)
            .addSubcommand(caseRemove)
    )
    .addSubcommandGroup((subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
        subcommandGroup
            .setName('item')
            .setDescription('Команды для взаимодействия с предметами')
            .addSubcommand(itemCreate)
            .addSubcommand(itemEdit)
            .addSubcommand(itemRemove)
    )
    .addSubcommandGroup((subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
        subcommandGroup
            .setName('quality')
            .setDescription('Команды для взаимодействия с качеством для предметов')
            .addSubcommand(qualityCreate)
            .addSubcommand(qualityEdit)
            .addSubcommand(qualityRemove)
    )
    .addSubcommandGroup((subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
        subcommandGroup
            .setName('inventory')
            .setDescription('Команды для взаимодействия с инвентарём')
            .addSubcommand(inventoryAdd)
            .addSubcommand(inventoryRemove)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
