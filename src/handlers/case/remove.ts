import {ChatInputCommandInteraction} from 'discord.js'
import {ItemGroup} from '../../entities/psilocybin/ItemGroup'
import ItemGroupRepository from '../../repositories/ItemGroupRepository'

export async function removeCaseHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const caseId: number = interaction.options.getNumber('case', true)
    const caseEntity: ItemGroup|null = await ItemGroupRepository.findOne({
        where: {
            id: caseId,
            serverId: interaction.guildId!,
        },
        relations: ['items', 'items.quality']
    })

    if (!caseEntity) {
        await interaction.editReply(`Кейс не найден`)
        return
    }

    try {
        await caseEntity.remove()
        await interaction.editReply(`Кейс удалён`)
    } catch (e) {
        console.error(e)
        await interaction.editReply(`Не удалось удалить кейс`)
    }
}
