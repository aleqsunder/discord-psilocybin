import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    GuildTextBasedChannel,
    Message
} from 'discord.js'
import DisTube, {Events, Playlist, Queue, Song} from 'distube'
import {YouTubePlugin} from '@distube/youtube'
import {formatTime} from '../utils/timeUtils'
import SoundCloudPlugin from '@distube/soundcloud'
import {DirectLinkPlugin} from '@distube/direct-link'
import AppleMusicPlugin from 'distube-apple-music'
import path from 'path'
import fs from 'fs/promises'
import ytdl from '@distube/ytdl-core'

export type Plugin = SoundCloudPlugin
    | DirectLinkPlugin
    | AppleMusicPlugin
    | YouTubePlugin

export let youtubeInstance: YouTubePlugin|null = null
export let soundcloudInstance: SoundCloudPlugin = new SoundCloudPlugin()

export default class DisTubeService {
    private static instance: DisTube|null = null
    private static musicMessages: Map<string, Message> = new Map<string, Message>()
    private static disconnectTimers: Map<string, NodeJS.Timeout> = new Map<string, NodeJS.Timeout>()

    private static playlistShowLimit: number = 20

    public static async init(client: Client): Promise<DisTube> {
        if (this.instance === null) {
            const cookies: ytdl.Cookie[]|undefined = await this.loadCookies()
            youtubeInstance = new YouTubePlugin({cookies})

            const plugins: Plugin[] = [
                youtubeInstance,
                soundcloudInstance,
                new DirectLinkPlugin(),
                new AppleMusicPlugin(),
            ]

            this.instance = new DisTube(client, {
                nsfw: true,
                plugins,
            })

            this.instance.on(Events.ERROR, this.onError.bind(this))
            this.instance.on(Events.ADD_SONG, this.onAddMusic.bind(this))
            this.instance.on(Events.ADD_LIST, this.onAddList.bind(this))
            this.instance.on(Events.PLAY_SONG, this.onPlaySong.bind(this))
            this.instance.on(Events.FINISH, this.onFinishSong.bind(this))
            this.instance.on(Events.FINISH_SONG, this.onFinishSong.bind(this))
            this.instance.on(Events.DISCONNECT, this.onDisconnect.bind(this))
        }

        return this.instance
    }

    private static async loadCookies(): Promise<ytdl.Cookie[]> {
        const cookiesPath = path.resolve(__dirname, 'cookies.json')

        try {
            await fs.access(cookiesPath)
            const data = await fs.readFile(cookiesPath, 'utf-8')
            return JSON.parse(data)
        } catch (error) {
            console.error('Ошибка cookie parse:', error)
            return []
        }
    }

    public static get(): DisTube {
        if (this.instance === null) {
            throw new Error('DisTube не инициализирован')
        }

        return this.instance
    }

    public static getCurrentQueue(interaction: ButtonInteraction|ChatInputCommandInteraction): Queue|null {
        if (!this.instance) {
            return null
        }

        return this.instance.getQueue(interaction.guildId!) ?? null
    }

    public static async pauseMusic(queue: Queue) {
        await queue.pause()
    }

    public static async resumeMusic(queue: Queue) {
        await queue.resume()
    }

    public static async skipMusic(queue: Queue) {
        await queue.skip()
    }

    public static async stopMusic(queue: Queue) {
        await queue.stop()
        await this.onFinishSong(queue)
    }

    public static async updateControlButtons(interaction: ButtonInteraction, queue: Queue) {
        await interaction.update({
            components: [this.getControlButtons(queue)]
        })
    }

    public static clearTimeoutIfExists(queue: Queue) {
        if (this.disconnectTimers.has(queue.id)) {
            clearTimeout(this.disconnectTimers.get(queue.id))
            this.disconnectTimers.delete(queue.id)
        }
    }

    private static async onError(error: Error, queue: Queue): Promise<void> {
        console.error('Ошибка DisTube:', error)
        await this.instance?.stop(queue)
    }

    private static async onAddMusic(queue: Queue, song: Song): Promise<void> {
        this.clearTimeoutIfExists(queue)

        const textChannel = queue.textChannel as GuildTextBasedChannel
        await textChannel.send({
            embeds: [this.createOnAddMusicEmbed(queue, song)]
        })

        if (this.musicMessages.has(queue.id)) {
            const message: Message = this.musicMessages.get(queue.id)!
            await message.edit({
                embeds: [this.createMusicEmbed(queue)],
                components: [this.getControlButtons(queue)]
            })
        }
    }

    private static async onAddList(queue: Queue, playlist: Playlist): Promise<void> {
        this.clearTimeoutIfExists(queue)

        const textChannel = queue.textChannel as GuildTextBasedChannel
        await textChannel.send({
            embeds: [this.createOnAddListEmbed(queue, playlist)]
        })

        if (this.musicMessages.has(queue.id)) {
            const message: Message = this.musicMessages.get(queue.id)!
            await message.edit({
                embeds: [this.createMusicEmbed(queue)],
                components: [this.getControlButtons(queue)]
            })
        }
    }

    private static async onPlaySong(queue: Queue, song: Song): Promise<void> {
        this.clearTimeoutIfExists(queue)

        const textChannel = queue.textChannel as GuildTextBasedChannel
        const newMessage: Message = await textChannel.send({
            embeds: [this.createMusicEmbed(queue)],
            components: [this.getControlButtons(queue)]
        })

        this.musicMessages.set(queue.id, newMessage)
    }

    private static async onFinishSong(queue: Queue): Promise<void> {
        if (this.musicMessages.has(queue.id)) {
            const message: Message|undefined = this.musicMessages.get(queue.id)
            if (!message) {
                return
            }

            await this.deleteMessage(message)
        }

        await this.handleQueueCompletion(queue)
    }

    private static async onDisconnect(queue: Queue): Promise<void> {
        this.clearTimeoutIfExists(queue)
        await this.clearMusicMessage(queue)

        if (this.instance?.queues.has(queue.id)) {
            this.instance.queues.remove(queue.id)
        }
    }

    private static async clearMusicMessage(queue: Queue): Promise<void> {
        try {
            if (this.musicMessages.has(queue.id)) {
                const message: Message = this.musicMessages.get(queue.id)!
                await this.deleteMessage(message)

                this.musicMessages.delete(queue.id)
            }
        } catch (e) {
            console.log(e)
        }
    }

    public static async handleQueueCompletion(queue: Queue): Promise<void> {
        const timer: NodeJS.Timeout = setTimeout(async () => {
            this.instance?.voices.leave(queue.id)

            await this.clearMusicMessage(queue)
            this.disconnectTimers.delete(queue.id)
        }, 6e4)

        this.disconnectTimers.set(queue.id, timer)
    }

    private static async deleteMessage(message: Message) {
        try {
            await message.delete()
        } catch (e) {
            // Сообщение уже удалено или недоступно для удаления, скип
        }
    }

    private static createMusicEmbed(queue: Queue): EmbedBuilder {
        const currentSong: Song = queue.songs[0]

        return new EmbedBuilder()
            .setTitle(`Сейчас играет: ${currentSong.name}`)
            .setURL(currentSong?.url ?? null)
            .setDescription(
                queue.songs.length > 0
                    ? `Песен в очереди: ${queue.songs.length}`
                    : 'Очередь пуста'
            )
            .setThumbnail(currentSong?.thumbnail ?? null)
            .setColor('#ff9900')
    }

    private static createOnAddMusicEmbed(queue: Queue, song: Song): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(`Трек добавлен!`)
            .setDescription(`[${song.name}](${song.url}) (${formatTime(song.duration)})`)
            .setThumbnail(song.thumbnail ?? null)
            .setColor('#ff9900')
    }

    private static createOnAddListEmbed(queue: Queue, playlist: Playlist): EmbedBuilder {
        let songs: Song[] = playlist.songs
        if (songs.length > this.playlistShowLimit) {
            songs = songs.slice(0, this.playlistShowLimit)
        }

        return new EmbedBuilder()
            .setTitle(`Треки добавлены!`)
            .setDescription(
                songs.map((song, i) =>
                    `${i + 1}. [${song.name}](${song.url}) (${formatTime(song.duration)})`
                ).join('\n') +
                (playlist.songs.length > this.playlistShowLimit
                    ? `\nИ ещё ${playlist.songs.length - this.playlistShowLimit} треков`
                    : ''
                )
            )
            .setThumbnail(songs[0].thumbnail ?? null)
            .setColor('#ff9900')
    }

    private static getControlButtons(queue: Queue): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(queue.paused ? 'resume' : 'pause')
                    .setLabel(queue.paused ? '▶' : '⏸')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('skip')
                    .setLabel('⏭')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('stop')
                    .setLabel('⏹')
                    .setStyle(ButtonStyle.Danger)
            )
    }
}
