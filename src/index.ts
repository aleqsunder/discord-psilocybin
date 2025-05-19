import {Client, GatewayIntentBits, Guild} from 'discord.js'
import {initializeDatabase} from './database/db'
import {interactionCreateHandler} from './events/interactionCreate'
import {guildCreateHandler} from "./events/guildCreate"
import {registerCommands} from "./events/registerCommands"
import DisTubeService from './services/DistubeService'
import {TOKEN} from './constants'

export const client: Client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ],
})

client.on('ready', async () => {
    console.log(`Бот запущен как ${client.user?.tag}`)

    await initializeDatabase()
    await registerCommands(client)

    DisTubeService.init(client)
})

client.on('interactionCreate', interactionCreateHandler)
client.on('guildCreate', (guild: Guild) => guildCreateHandler(guild, client))

client.login(TOKEN)
