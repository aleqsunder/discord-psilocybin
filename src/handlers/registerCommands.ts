import {Client} from "discord.js"
import {serverCommands, userCommands} from "../commands"

export async function registerCommandsHandler(client: Client): Promise<void> {
    try {
        if (!client.application) {
            throw new Error('приложение не зарегистрировано')
        }

        // Очистка старых серверных команд
        for (const guild of client.guilds.cache.values()) {
            await client.application.commands.set([], guild.id)
        }

        await client.application.commands.set([
            ...serverCommands,
            ...userCommands,
        ])

        console.log('Команды зарегистрированы для всех серверов')
    } catch (error) {
        console.error('Ошибка регистрации команд:', error)
    }
}
