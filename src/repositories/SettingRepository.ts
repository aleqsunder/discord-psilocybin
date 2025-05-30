import {Repository} from 'typeorm'
import {Setting} from '../entities/psilocybin/Setting'
import {Interaction, Snowflake} from 'discord.js'
import SettingService from '../services/SettingService'
import {Psilocybin} from '../database/psilocybin'

class SettingRepository extends Repository<Setting> {
    async getSettingByServerId(serverId: Snowflake): Promise<Setting|null> {
        return this.findOneBy({serverId})
    }

    async getCurrentSetting(interaction: Interaction): Promise<Setting> {
        const {guildId} = interaction
        if (!guildId) {
            throw new Error('Метод вызван вне контекста сервера')
        }

        let setting: Setting|null = await this.getSettingByServerId(guildId)
        if (!setting) {
            setting = await SettingService.createNewSetting(guildId)
        }

        return setting
    }

    async getCurrentSettingByServerId(serverId: SnowflakeOrNull): Promise<Setting> {
        if (!serverId) {
            throw new Error('Метод вызван вне контекста сервера')
        }

        let setting: Setting|null = await this.getSettingByServerId(serverId)
        if (!setting) {
            setting = await SettingService.createNewSetting(serverId)
        }

        return setting
    }
}

export default new SettingRepository(Setting, Psilocybin.createEntityManager())
