import {AttachmentBuilder, ChatInputCommandInteraction, Collection, Guild, GuildMember, Snowflake} from 'discord.js'
import {MuhomorUser} from '../entities/MuhomorUser'
import MuhomorUserRepository from '../repositories/MuhomorUserRepository'
import {LeaderboardEntry, renderLeaderboard} from '../utils/leaderboardUtils'

const TOP_SIZE: number = 10
const TOP_FETCH_LIMIT: number = 24
const MEMBERS_FETCH_TIMEOUT: number = 15e3
const EMPTY_MESSAGE: string = 'На сервере ещё никто не заработал поинтов'

async function resolveMembers(guild: Guild, userIds: Snowflake[]): Promise<Collection<Snowflake, GuildMember>> {
    try {
        return await guild.members.fetch({user: userIds, time: MEMBERS_FETCH_TIMEOUT})
    } catch (e) {
        console.error('Не удалось получить участников пачкой:', e)
    }

    const members = new Collection<Snowflake, GuildMember>()
    const results = await Promise.allSettled(userIds.map(userId => guild.members.fetch(userId)))

    for (const result of results) {
        if (result.status === 'fulfilled') {
            members.set(result.value.id, result.value)
        }
    }

    return members
}

// interaction.guild берётся из кэша клиента и на свежем сервере может быть ещё пустым,
// а guildId приходит в самом взаимодействии и есть всегда — сервер догружаем по нему
async function resolveGuild(interaction: ChatInputCommandInteraction): Promise<Guild|null> {
    if (interaction.guild) {
        return interaction.guild
    }

    if (!interaction.guildId) {
        return null
    }

    try {
        return await interaction.client.guilds.fetch(interaction.guildId)
    } catch (e) {
        console.error('Не удалось получить сервер:', e)
        return null
    }
}

export async function topHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()

    const serverId: Snowflake = interaction.guildId!
    const users: MuhomorUser[] = await MuhomorUserRepository.getTopByPoints(serverId, TOP_FETCH_LIMIT)
    if (users.length === 0) {
        await interaction.editReply(EMPTY_MESSAGE)
        return
    }

    const guild: Guild|null = await resolveGuild(interaction)
    if (!guild) {
        await interaction.editReply('Не удалось получить данные сервера, попробуйте ещё раз')
        return
    }

    const members: Collection<Snowflake, GuildMember> = await resolveMembers(guild, users.map(user => user.userid))
    const ranked: LeaderboardEntry[] = []

    for (const user of users) {
        const member: GuildMember|undefined = members.get(user.userid)
        if (!member) {
            continue
        }

        ranked.push({
            position: ranked.length + 1,
            name: member.displayName,
            points: user.points,
            avatarUrl: member.displayAvatarURL({extension: 'png', forceStatic: true, size: 128}),
            userId: member.id,
        })
    }

    if (ranked.length === 0) {
        await interaction.editReply(EMPTY_MESSAGE)
        return
    }

    const attachment: AttachmentBuilder = await renderLeaderboard({
        title: 'ЛИДЕРБОРД',
        entries: ranked.slice(0, TOP_SIZE),
    })

    await interaction.editReply({files: [attachment]})
}
