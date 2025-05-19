import {ButtonInteraction} from 'discord.js'
import DisTubeService from '../../services/DistubeService'
import {Queue} from 'distube'

export async function musicControlHandler(interaction: ButtonInteraction, command: string): Promise<void> {
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
