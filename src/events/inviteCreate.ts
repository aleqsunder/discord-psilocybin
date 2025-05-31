import {Client, Guild, Invite, PermissionsBitField, TextChannel, GuildMember, ClientUser} from 'discord.js'
import {Setting} from '../entities/psilocybin/Setting'
import SettingRepository from '../repositories/SettingRepository'

export async function inviteCreateHandler(invite: Invite, client: Client): Promise<void> {
    if (!invite.guild || !invite.inviter) {
        return
    }

    const guild = invite.guild as Guild
    const inviterMember: GuildMember = await guild.members.fetch(invite.inviter.id)
    if (!inviterMember) {
        return
    }

    const botUser: ClientUser|null = client.user
    const isAdministrator: boolean = inviterMember.permissions.has(PermissionsBitField.Flags.Administrator)
    const isBot: boolean = inviterMember.id === botUser?.id

    if (isAdministrator || isBot) {
        return
    }

    const setting: Setting = await SettingRepository.getCurrentSettingByServerId(invite.guild.id)
    if (setting.availableForCreatingInvite) {
        return
    }

    const channel = invite.channel as TextChannel

    try {
        await invite.delete()
        await channel.send(`Попытка создания инвайта пользователем <@${inviterMember.user.id}> при отсутствии прав (попытка обойти ограничение, установленное в настройках бота)`)
    } catch (e) {
        console.error(`Ошибка при удалении инвайта ${invite.url}:`, e)
    }

    try {
        await inviterMember.timeout(60 * 1000, 'Попытка создания инвайта при отсутствии прав')
        console.log(`Пользователь ${inviterMember.user.tag} был замучен на 1 минуту`)

        await inviterMember.send('Вы были замучены на 1 минуту на сервере за попытку создания инвайт-ссылки (попытка обойти ограничение, установленное в настройках бота)')
    } catch (e) {
        console.error(`Не удалось замутить пользователя ${inviterMember.user.tag}:`, e)
        await channel.send(`Не удалось замутить пользователя <@${inviterMember.user.id}>, но инвайт был удален`)
    }
}
