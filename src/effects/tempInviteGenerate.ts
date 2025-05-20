import {AbstractEffect} from './abstractEffect'
import {ChatInputCommandInteraction, GuildMember, REST, Routes, VoiceChannel} from 'discord.js'
import process from 'process'

const TOKEN: string = process.env.DISCORD_TOKEN || ''

interface PartialRestTempVoiceInvite {
    code: string
}

// Грязный "хак" дискорда, т.к. текущая версия API не даёт создавать гостевые инвайты!!
export const rest: REST = new REST({version: '9', headers: {
    "x-super-properties": "ewogICJvcyI6ICJXaW5kb3dzIiwKICAiY2xpZW50X2J1aWxkX251bWJlciI6IDI3NTIwOAp9"
}}).setToken(TOKEN)

export class TempInviteGenerate extends AbstractEffect {
    removeAfterUse = true

    name = 'Создание временной инвайт-ссылки'
    shortName = '⌛💌'
    description = 'Создаёт временную ссылку для войса. Во время генерации вам необходимо находиться в нужном войсе'

    async onEffect(interaction: ChatInputCommandInteraction): Promise<void> {
        const member: GuildMember = interaction.member as GuildMember
        const voiceChannel = member.voice.channel as VoiceChannel|null
        if (!voiceChannel) {
            throw new Error('Вы должны находиться в войсе')
        }

        try {
            const invite: PartialRestTempVoiceInvite = await rest.post(Routes.channelInvites(voiceChannel.id), {
                body: {
                    max_age: 3600,
                    max_uses: 1,
                    temporary: false,
                    flags: 1,
                },
            }) as PartialRestTempVoiceInvite

            await interaction.user.send(`Временная инвайт-ссылка в голосовой чат: https://discord.gg/${invite.code}\nВремя жизни: час`)
            await interaction.reply('Временная инвайт-ссылка создана и отправлена в ЛС')
        } catch (e) {
            console.log(e)
            throw new Error('Не удалось создать временную инвайт-ссылку')
        }
    }
}
