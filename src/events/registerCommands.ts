import {Client, REST, Routes} from "discord.js"
import {list as commands} from "../commands/list"
import process from "process"

const TOKEN: string = process.env.DISCORD_TOKEN || ''
const CLIENT_ID: string = process.env.DISCORD_CLIENT_ID || ''

export const rest: REST = new REST({version: '10'}).setToken(TOKEN)

export async function registerCommands(client: Client): Promise<void> {
    try {
        const guilds = await client.guilds.fetch()
        for (const guild of guilds.values()) {
            await rest.put(Routes.applicationGuildCommands(CLIENT_ID, guild.id), {body: commands})
            console.log(`Команды зарегистрированы для сервера ${guild.name} (ID: ${guild.id})`)
        }
    } catch (error) {
        console.error(error)
    }
}
