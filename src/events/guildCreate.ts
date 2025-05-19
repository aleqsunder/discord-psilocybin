import {Guild, TextChannel, ChannelType, Client} from "discord.js"
import {registerCommands} from "./registerCommands"

export async function guildCreateHandler(guild: Guild, client: Client): Promise<void> {
    console.log(`Бот был добавлен на сервер: ${guild.name} (ID: ${guild.id})`)
    await registerCommands(client)

    const botMember = guild.members.me
    if (!botMember) {
        return
    }

    const defaultChannel = guild.channels.cache.find(channel =>
        channel.type === ChannelType.GuildText && channel.permissionsFor(botMember).has('SendMessages')
    ) as TextChannel | undefined

    if (defaultChannel) {
        await defaultChannel.send(`Спасибо за добавление меня на сервер, чмо анимешное`)
    } else {
        console.error('Не дали канал для отправки сообщения')
    }
}