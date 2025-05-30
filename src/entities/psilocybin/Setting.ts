import {BaseEntity, Column, Entity, PrimaryColumn} from 'typeorm'
import {Snowflake} from 'discord.js'
import {PsilocybinSetting} from '../../decorators/PsilocybinSettingMetadata'

@Entity('psilocybin_settings')
export class Setting extends BaseEntity {
    @PrimaryColumn({name: 'server_id', type: 'text'})
    serverId!: Snowflake

    @Column({name: 'available_to_use', type: 'boolean', default: false, nullable: false})
    @PsilocybinSetting('Включает доступ к боту для пользователей')
    availableToUse: boolean = false

    @Column({name: 'available_for_creating_invite', type: 'boolean', default: true, nullable: false})
    @PsilocybinSetting('Позволяет пользователям создавать инвайты в обход бота')
    availableForCreatingInvite: boolean = true
}
