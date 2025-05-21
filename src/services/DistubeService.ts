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

const getRandomIPv6 = (ip: string) => {
    if (!isIPv6(ip)) {
        throw new Error("Invalid IPv6 format");
    }

    const [rawAddr, rawMask] = ip.split("/");
    const mask = parseInt(rawMask, 10);

    if (isNaN(mask) || mask > 128 || mask < 1) {
        throw new Error("Invalid IPv6 subnet mask (must be between 1 and 128)");
    }

    const base10addr = normalizeIP(rawAddr);

    const fullMaskGroups = Math.floor(mask / 16);
    const remainingBits = mask % 16;

    const result = new Array(8).fill(0);

    for (let i = 0; i < 8; i++) {
        if (i < fullMaskGroups) {
            result[i] = base10addr[i];
        } else if (i === fullMaskGroups && remainingBits > 0) {
            const groupMask = 0xffff << (16 - remainingBits);
            const randomPart = Math.floor(Math.random() * (1 << (16 - remainingBits)));
            result[i] = (base10addr[i] & groupMask) | randomPart;
        } else {
            result[i] = Math.floor(Math.random() * 0x10000);
        }
    }

    return result.map(x => x.toString(16).padStart(4, "0")).join(":");
}

const isIPv6 = (ip: string) => {
    const IPV6_REGEX =
        /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]))(?:\/(?:1[0-1][0-9]|12[0-8]|[1-9][0-9]|[1-9]))?$/;
    return IPV6_REGEX.test(ip);
}

const normalizeIP = (ip: string) => {
    const parts = ip.split("::");
    let start = parts[0] ? parts[0].split(":") : [];
    let end = parts[1] ? parts[1].split(":") : [];

    const missing = 8 - (start.length + end.length);
    const zeros = new Array(missing).fill("0");

    const full = [...start, ...zeros, ...end];

    return full.map(part => parseInt(part || "0", 16));
}

export default class DisTubeService {
    private static instance: DisTube|null = null
    private static musicMessages: Map<string, Message> = new Map<string, Message>()

    public static async init(client: Client): Promise<DisTube> {
        const cookies: ytdl.Cookie[]|undefined = await this.loadCookies()

        const agent = ytdl.createAgent(undefined, {
            localAddress: getRandomIPv6("2001:2::/48"),
        });

        if (this.instance === null) {
            this.instance = new DisTube(client, {
                emitNewSongOnly: true,
                plugins: [
                    new YouTubePlugin({
                        cookies,
                        ytdlOptions: {
                            agent,
                        }
                    }),
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
