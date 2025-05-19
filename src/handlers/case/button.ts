import {ButtonInteraction, MessageFlagsBitField} from 'discord.js'
import PaginationCache, {CaseItemCache, PaginationCacheType} from '../../services/CacheService'
import {formatCaseListPageAction} from './list'
import {formatCasePageAction} from './showCase'
import {ItemGroup} from '../../entities/psilocybin/ItemGroup'

async function caseListHandler(interaction: ButtonInteraction, option: string) {
    const page: number = Number(option) ?? 1
    await formatCaseListPageAction(interaction, 'case:list', page)
}

async function caseHandler(interaction: ButtonInteraction, option: string) {
    const messageId: string = interaction.message.id
    const cached: PaginationCacheType|undefined = PaginationCache.get(messageId) as CaseItemCache
    if (!cached) {
        await interaction.reply({
            content: 'Данные о странице устарели',
            flags: MessageFlagsBitField.Flags.Ephemeral
        })

        return
    }

    const page: number = Number(option) ?? 1
    const caseEntity: ItemGroup = cached.caseEntity
    await formatCasePageAction(interaction, 'case:item', caseEntity, page)
}

export async function casePaginationHandler(interaction: ButtonInteraction, subcommand: string, option: string) {
    switch (subcommand) {
        case 'list': return await caseListHandler(interaction, option)
        case 'item': return await caseHandler(interaction, option)
        default: throw new Error(`Несуществующая сабкоманда ${subcommand} (button)`)
    }
}
