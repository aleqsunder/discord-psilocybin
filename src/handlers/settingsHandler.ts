import {ChatInputCommandInteraction} from 'discord.js'
import {Setting} from '../entities/psilocybin/Setting'
import SettingRepository from '../repositories/SettingRepository'
import SettingService from '../services/SettingService'
import {formatTextToKebabCase} from '../utils/formatUtils'
import {isAdmin} from '../utils/permissionUtils'

type BooleanSettingPropertyKeys = {
    [K in keyof Setting]: Setting[K] extends boolean ? K : never
}[keyof Setting]

export async function settingsHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()
    if (!isAdmin(interaction)) {
        await interaction.editReply(`У вас недостаточно прав для выполнения данной команды`)
        return
    }

    const setting: Setting = await SettingRepository.getCurrentSetting(interaction)
    const serverSettingsDescriptionRows: string[] = []
    for (const [key, description] of Object.entries(SettingService.getSettingMetadata())) {
        const potentialSettingKey = key as keyof Setting
        if (typeof setting[potentialSettingKey] !== 'boolean') {
            continue
        }

        const settingKey: BooleanSettingPropertyKeys = potentialSettingKey as BooleanSettingPropertyKeys
        serverSettingsDescriptionRows.push(
            `### ${setting[settingKey] ? ':white_check_mark:' : ':no_entry_sign:'} \`${key}\`\n${description}`
        )

        const value: boolean | null = interaction.options.getBoolean(formatTextToKebabCase(settingKey))
        if (value === null) {
            continue
        }

        setting[settingKey] = value
    }

    await setting.save()
    await interaction.editReply(
        `### Теперь настройки вашего сервера выглядят следующим образом:\n`
        + serverSettingsDescriptionRows.join('\n')
    )
}
