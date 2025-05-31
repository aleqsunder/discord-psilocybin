import {UserContextMenuCommandInteraction} from 'discord.js'
import {listUserItemsHandler} from './inventory/list'

export enum UserContextCommandId {
    SHOW_USER_INVENTORY
}

export const CommandDisplayNames: Record<UserContextCommandId, string> = {
    [UserContextCommandId.SHOW_USER_INVENTORY]: 'Показать инвентарь пользователя'
}

export const DisplayNameToCommandIdMap: {[key: string]: UserContextCommandId} = {}
for (const enumNumericValue of Object.values(UserContextCommandId).filter(value => typeof value === 'number')) {
    const commandId = enumNumericValue as UserContextCommandId
    const displayName = CommandDisplayNames[commandId]

    DisplayNameToCommandIdMap[displayName] = commandId
}

export function getCommandIdByDisplayName(displayName: string): UserContextCommandId|undefined {
    return DisplayNameToCommandIdMap[displayName]
}

export async function userContextMenuHandler(interaction: UserContextMenuCommandInteraction): Promise<void> {
    await interaction.deferReply()

    const command: UserContextCommandId|undefined = getCommandIdByDisplayName(interaction.commandName)
    if (command === undefined) {
        await interaction.editReply('Команда не найдена')
        return
    }

    switch (command) {
        case UserContextCommandId.SHOW_USER_INVENTORY: return await listUserItemsHandler(interaction)
    }

    throw new Error(`Несуществующая команда ${command} (button)`)
}
