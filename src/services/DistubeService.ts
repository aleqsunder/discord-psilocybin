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
import DisTube, {Events, Queue, Song} from 'distube'
import {YouTubePlugin} from '@distube/youtube'
import {formatTime} from '../utils/timeUtils'
import SoundCloudPlugin from '@distube/soundcloud'
import {DirectLinkPlugin} from '@distube/direct-link'
import AppleMusicPlugin from 'distube-apple-music'
import path from 'path'
import fs from 'fs/promises'
import ytdl from '@distube/ytdl-core'

export default class DisTubeService {
    private static instance: DisTube|null = null
    private static musicMessages: Map<string, Message> = new Map<string, Message>()

    public static async init(client: Client): Promise<DisTube> {
        const cookies: ytdl.Cookie[]|undefined = await this.loadCookies()

        if (this.instance === null) {
            this.instance = new DisTube(client, {
                emitNewSongOnly: true,
                plugins: [
                    new YouTubePlugin({cookies}),
                    new SoundCloudPlugin(),
                    new DirectLinkPlugin(),
                    new AppleMusicPlugin(),
                ]
            })

            this.instance.on(Events.ERROR, this.onError.bind(this))
            this.instance.on(Events.ADD_SONG, this.onAddMusic.bind(this))
            this.instance.on(Events.PLAY_SONG, this.onPlaySong.bind(this))
            this.instance.on(Events.FINISH, this.onFinish.bind(this))
        }

        return this.instance
    }

    private static async loadCookies(): Promise<ytdl.Cookie[]|undefined> {
        const cookiesPath = path.resolve(__dirname, 'cookies.json')

        try {
            await fs.access(cookiesPath)
            const data = await fs.readFile(cookiesPath, 'utf-8')
            return JSON.parse(data)
        } catch (error) {
            console.error('Ошибка cookie parse:', error)
            return undefined
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
        await this.onFinish(queue)
    }

    public static async updateControlButtons(interaction: ButtonInteraction, queue: Queue) {
        await interaction.update({
            components: [this.getControlButtons(queue)]
        })
    }

    private static onError(error: Error): void {
        console.error('Ошибка DisTube:', error)
    }

    private static async onAddMusic(queue: Queue): Promise<void> {
        if (!this.musicMessages.has(queue.id)) {
            return
        }

        const message: Message = this.musicMessages.get(queue.id)!
        await message.edit({
            embeds: [this.createMusicEmbed(queue)],
            components: [this.getControlButtons(queue)]
        })
    }

    private static async onPlaySong(queue: Queue): Promise<void> {
        const textChannel = queue.textChannel as GuildTextBasedChannel

        if (this.musicMessages.has(queue.id)) {
            const message: Message = this.musicMessages.get(queue.id)!
            await message.edit({
                embeds: [this.createMusicEmbed(queue)],
                components: [this.getControlButtons(queue)]
            })
        } else {
            const message: Message = await textChannel.send({
                embeds: [this.createMusicEmbed(queue)],
                components: [this.getControlButtons(queue)]
            })

            this.musicMessages.set(queue.id, message)
        }
    }

    private static async onFinish(queue: Queue): Promise<void> {
        if (!this.musicMessages.has(queue.id)) {
            return
        }

        const message: Message = this.musicMessages.get(queue.id)!
        await message.delete()
        this.musicMessages.delete(queue.id)
    }

    private static createMusicEmbed(queue: Queue): EmbedBuilder {
        const currentSong: Song = queue.songs[0]
        const nextSongs: Song[] = queue.songs.slice(1, 11)

        return new EmbedBuilder()
            .setTitle(`Сейчас играет: ${currentSong.name}`)
            .setURL(currentSong?.url ?? null)
            .setDescription(
                nextSongs.length > 0
                    ? `**Следующие треки:**\n${nextSongs.map((song, i) =>
                        `${i + 1}. [${song.name}](${song.url}) (${formatTime(song.duration)})`
                    ).join('\n')}`
                    : 'Очередь пуста'
            )
            .setThumbnail(currentSong?.thumbnail ?? null)
            .setColor('#ff9900')
            .setFooter({text: `Всего треков: ${queue.songs.length}`})
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
