import {BaseEntity, Column, Entity, PrimaryColumn} from 'typeorm'
import {Snowflake} from 'discord.js'

// Пожизненная статистика игрока. Ход игры лежит в CasinoSession, привязанной к сообщению
@Entity('psilocybin_casino_players')
export class CasinoPlayer extends BaseEntity {
    @PrimaryColumn({name: 'server_id', type: 'text'})
    serverId!: Snowflake

    @PrimaryColumn({name: 'user_id', type: 'text'})
    userId!: Snowflake

    @Column({name: 'total_spent', type: 'integer', default: 0})
    totalSpent: number = 0

    @Column({name: 'total_won', type: 'integer', default: 0})
    totalWon: number = 0
}
