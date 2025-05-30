import {Setting} from '../entities/psilocybin/Setting'
import {getMetadataArgsStorage} from 'typeorm'
import {MetadataArgsStorage} from 'typeorm/metadata-args/MetadataArgsStorage'

export default class SettingService {
    public static async createNewSetting(serverId: SnowflakeOrNull): Promise<Setting> {
        if (!serverId) {
            throw new Error('Невозможно создать настройку сервера, не будучи на сервере')
        }

        const setting: Setting = new Setting()
        setting.serverId = serverId

        await setting.save()
        return setting
    }

    public static getSettingMetadata(): Record<keyof Setting, string> {
        const storage: MetadataArgsStorage = getMetadataArgsStorage()
        const descriptions = {} as Record<keyof Setting, string>

        for (const col of storage.columns) {
            if (col.options?.description) {
                descriptions[col.propertyName as keyof Setting] = col.options.description
            }
        }

        return descriptions
    }
}
