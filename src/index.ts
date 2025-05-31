import {Client, GatewayIntentBits} from 'discord.js'
import {TOKEN} from './constants'
import {GlobalFonts} from '@napi-rs/canvas'
import path from 'path'
import {loadEvents} from './events/loadEvents'

GlobalFonts.registerFromPath(path.join(__dirname, '../fonts/NotoColorEmoji-Regular.ttf'), 'emojis')
GlobalFonts.registerFromPath(path.join(__dirname, '../fonts/Montserrat-Medium.ttf'), 'montserrat-medium')
GlobalFonts.registerFromPath(path.join(__dirname, '../fonts/Montserrat-Light.ttf'), 'montserrat')

export const client: Client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,
    ],
})

loadEvents(client)

client.login(TOKEN)
