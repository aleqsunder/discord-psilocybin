import {ChatInputCommandInteraction, GuildMember, GuildTextBasedChannel, VoiceBasedChannel} from 'discord.js'
import DisTube from 'distube'
import DisTubeService, {youtubeInstance} from '../../services/DistubeService'
import {InventoryItem} from '../../entities/psilocybin/InventoryItem'
import InventoryItemRepository from '../../repositories/InventoryItemRepository'
import {EffectType} from '../../factories/EffectFactory'
import ytpl, {result} from '@distube/ytpl'
import {YouTubePlaylist} from '@distube/youtube'

export async function musicHandler(interaction: ChatInputCommandInteraction): Promise<void> {
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

    const song: string = interaction.options.getString('song', true)

    try {
        const player: DisTube = DisTubeService.get()
        if (ytpl.validateID(song)) {
            if (!youtubeInstance) {
                await interaction.editReply(`Youtube не инициализирован`)
                return
            }

            await interaction.editReply(`Получаем список треков из плейлиста Youtube`)
            const info: result = await ytpl(song, {limit: Infinity})
            const playlist = new YouTubePlaylist(youtubeInstance, info, {member})
            await player.play(voiceChannel, playlist, {textChannel, member})
        } else {
            await player.play(voiceChannel, song, {textChannel, member})
        }

        await interaction.deleteReply()
    } catch (e) {
        switch (true) {
            case e instanceof Error:
                await interaction.editReply(`Ошибка воспроизведения: ${e.message}`)
                break
            default:
                await interaction.editReply('Ошибка воспроизведения, подробности в консоли')
                console.log(e)
        }
    }
}
