import {Client, Events} from 'discord.js'
import {interactionCreateHandler} from './interactionCreate'
import {guildCreateHandler} from './guildCreate'
import {inviteCreateHandler} from './inviteCreate'
import {clientReadyHandler} from './clientReady'

export function loadEvents (client: Client) {
    client.on(Events.ClientReady, _ => clientReadyHandler(client))
    client.on(Events.InteractionCreate, interactionCreateHandler)
    client.on(Events.GuildCreate, guild => guildCreateHandler(guild, client))
    client.on(Events.InviteCreate, invite => inviteCreateHandler(invite, client))
}
