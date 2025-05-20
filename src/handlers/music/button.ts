import {ButtonInteraction, GuildMember, VoiceBasedChannel} from 'discord.js'
import DisTubeService from '../../services/DistubeService'
import {Queue} from 'distube'
import {InventoryItem} from '../../entities/psilocybin/InventoryItem'
import InventoryItemRepository from '../../repositories/InventoryItemRepository'
import {EffectType} from '../../factories/EffectFactory'

export async function musicControlHandler(interaction: ButtonInteraction, command: string): Promise<void> {
    const member: GuildMember = interaction.member as GuildMember
    const voiceChannel: VoiceBasedChannel|null = member.voice.channel
    if (!voiceChannel) {
        await interaction.reply('Вы должны находиться в войсе')
        return
    }

    const inventoryItem: InventoryItem|null = await InventoryItemRepository.getOneByFilter({
        serverId: interaction.guildId!,
        userId: member.id,
        effect: EffectType.MusicEffect,
    })

    if (!inventoryItem) {
        await interaction.reply('В вашем инвентаре нет предмета с эффектом "Музыкальный бот"')
        return
    }

    const queue: Queue|null = DisTubeService.getCurrentQueue(interaction)
    if (!queue) {
        await interaction.update({
            content: 'Нет активной очереди',
            components: [],
            embeds: [],
        })

        return
    }

    try {
        switch (command) {
            case 'stop': return await DisTubeService.stopMusic(queue)

            case 'pause': await DisTubeService.pauseMusic(queue); break
            case 'resume': await DisTubeService.resumeMusic(queue); break
            case 'skip': await DisTubeService.skipMusic(queue); break
        }
    } catch (error) {
        // Значит нельзя
    }

    await DisTubeService.updateControlButtons(interaction, queue)
}
