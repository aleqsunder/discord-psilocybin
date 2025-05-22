import {ChatInputCommandInteraction} from 'discord.js'
import {ItemQuality} from '../../entities/psilocybin/ItemQuality'
import ItemQualityRepository from '../../repositories/ItemQualityRepository'

export async function removeItemQualityHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const qualityId: number = interaction.options.getNumber('quality', true)
    const itemQuality: ItemQuality|null = await ItemQualityRepository.findOneBy({
        id: qualityId,
        serverId: interaction.guildId!,
    })

    if (!itemQuality) {
        await interaction.editReply(`Качество не существует`)
        return
    }

    try {
        await itemQuality.remove()
        await interaction.editReply(`Качество удалено`)
    } catch (e) {
        console.log(e)
        await interaction.editReply(`Не удалось удалить качество`)
    }
}
