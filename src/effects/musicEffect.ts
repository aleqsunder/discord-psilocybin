import {AbstractEffect} from './abstractEffect'
import {ChatInputCommandInteraction} from 'discord.js'

export class MusicEffect extends AbstractEffect {
    removeAfterUse = false

    name = 'Использование музыкального бота'
    shortName = '▶⏸'
    description = 'Позволяет использовать музыкального бота, если этот предмет находится в инвентаре'

    async onEffect(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply('Вам доступна команда `/play input`, где `input` - название трека или ссылка на него\n' +
            'Поддерживаются платформы: YouTube, Soundcloud')
    }
}
