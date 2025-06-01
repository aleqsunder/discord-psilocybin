import {Client, VoiceBasedChannel, VoiceState} from 'discord.js'
import DisTube, {DisTubeVoice, isVoiceChannelEmpty, Queue} from 'distube'
import DisTubeService from '../services/DistubeService'

export async function voiceStateUpdate(oldState: VoiceState, newState: VoiceState, client: Client): Promise<void> {
    const changedChannel: VoiceBasedChannel|null = oldState.channel ?? newState.channel
    if (!changedChannel) {
        return
    }

    if (newState.member?.user.bot) {
        return
    }

    const distube: DisTube = DisTubeService.get()
    const voice: DisTubeVoice|undefined = distube.voices.get(changedChannel.guild)
    if (!voice) {
        return
    }

    if (voice.channel?.id !== changedChannel.id) {
        return
    }

    const queue: Queue|undefined = distube.queues.get(changedChannel.guild)
    if (!queue) {
        return voice.leave()
    }

    if (isVoiceChannelEmpty(oldState)) {
        await DisTubeService.handleQueueCompletion(queue)
    } else {
        DisTubeService.clearTimeoutIfExists(queue)
    }
}
