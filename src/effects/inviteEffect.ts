import {AbstractEffect} from './abstractEffect'
import {ChatInputCommandInteraction, TextChannel} from 'discord.js'

export class InviteEffect extends AbstractEffect {
    removeAfterUse = true

    name = 'Инвайт'
    shortName = '💌'
    description = 'Позволяет получить ссылку на инвайт пользователя'

    async onEffect(interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            const channel = interaction.channel as TextChannel
            const invite = await channel.createInvite({
                maxAge: 3600 * 24,
                maxUses: 1,
                unique: true,
            })

            await interaction.user.send(`Инвайт-ссылка на сервер: ${invite.url}\nВремя жизни: 24 часа`)
            await interaction.reply('Инвайт-ссылка создана и отправлена в ЛС')
        } catch (e) {
            console.log(e)
            throw new Error('Не удалось создать инвайт-ссылку')
        }
    }
}
