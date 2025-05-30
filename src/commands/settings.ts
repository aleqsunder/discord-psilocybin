import {SlashCommandBuilder} from 'discord.js'
import SettingService from '../services/SettingService'
import {formatTextToKebabCase} from '../utils/formatUtils'

const settingMetadata: Record<string, string> = SettingService.getSettingMetadata()
const settingsCommand = new SlashCommandBuilder()
    .setName('settings')
    .setDescription('[Администратор] Регулирование настроек бота для сервера')

for (const [key, description] of Object.entries(settingMetadata)) {
    settingsCommand.addBooleanOption(option =>
        option
            .setName(formatTextToKebabCase(key))
            .setDescription(description)
    )
}

export const settings = settingsCommand.toJSON()
