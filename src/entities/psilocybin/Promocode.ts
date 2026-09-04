import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from 'typeorm'
import {Snowflake} from 'discord.js'

@Entity('psilocybin_promocodes')
export class Promocode extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({name: 'server_id', type: 'text'})
    serverId!: Snowflake

    @Column({type: 'text'})
    code!: string

    @Column({type: 'text', length: 100})
    name!: string

    @Column({type: 'integer'})
    money!: number

    @Column({name: 'creator_id', type: 'text'})
    creatorId!: Snowflake

    @Column({name: 'activated_by_id', type: 'text', nullable: true})
    activatedById!: SnowflakeOrNull

    @Column({name: 'created_at', type: 'integer'})
    createdAt!: number

    @Column({name: 'activated_at', type: 'integer', nullable: true})
    activatedAt!: number|null

    public isActivated(): boolean {
        return this.activatedById !== null
    }
}
