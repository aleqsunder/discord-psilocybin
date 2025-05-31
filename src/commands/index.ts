import {InteractionContextType} from 'discord.js'
import {serverCommandList} from './server'
import {userContextCommands} from './server/userContextCommands'

const serverCommands = serverCommandList
    .map(command => command
        .setContexts(InteractionContextType.Guild))

const jsonServerCommands = serverCommands.map(command => command.toJSON())

const userCommands = userContextCommands
    .map(command => command
        .setContexts(InteractionContextType.Guild))

export {
    serverCommands,
    userCommands,
    jsonServerCommands,
}
