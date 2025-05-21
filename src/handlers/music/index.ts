import {ChatInputCommandInteraction, GuildMember, GuildTextBasedChannel, VoiceBasedChannel} from 'discord.js'
import DisTube from 'distube'
import DisTubeService from '../../services/DistubeService'
import {InventoryItem} from '../../entities/psilocybin/InventoryItem'
import InventoryItemRepository from '../../repositories/InventoryItemRepository'
import {EffectType} from '../../factories/EffectFactory'

export default async function musicHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()

    const member: GuildMember = interaction.member as GuildMember
    const textChannel: GuildTextBasedChannel = interaction.channel as GuildTextBasedChannel
    const voiceChannel: VoiceBasedChannel|null = member.voice.channel
    if (!voiceChannel) {
        await interaction.editReply('Вы должны находиться в войсе')
        return
    }

    const inventoryItem: InventoryItem|null = await InventoryItemRepository.getOneByFilter({
        serverId: interaction.guildId!,
        userId: member.id,
        effect: EffectType.MusicEffect,
    })

    if (!inventoryItem) {
        await interaction.editReply('В вашем инвентаре нет предмета с эффектом "Музыкальный бот"')
        return
    }

    const input: string = interaction.options.getString('input', true)

    try {
        const player: DisTube = DisTubeService.get()
        await player.play(voiceChannel, input, {textChannel, member})
        await interaction.deleteReply()
    } catch (e) {
        console.log('Ошибка воспроизведения:', e)
    }
}
