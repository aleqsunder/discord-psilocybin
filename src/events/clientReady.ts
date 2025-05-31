import {Client} from 'discord.js'
import {initializeDatabase} from '../database/db'
import {registerCommandsHandler} from '../handlers/registerCommands'
import DisTubeService from '../services/DistubeService'

export async function clientReadyHandler(client: Client): Promise<void> {
    console.log(`Бот запущен как ${client.user?.tag}`)

    await initializeDatabase()
    await registerCommandsHandler(client)

    await DisTubeService.init(client)
}
