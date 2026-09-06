import {BaseEntity, Column, Entity, PrimaryColumn} from 'typeorm'
import {Snowflake} from 'discord.js'

// Одна сессия — одно сообщение. Игрок может держать несколько игр одновременно,
// и спины каждой живут только внутри своего сообщения
@Entity('psilocybin_casino_sessions')
export class CasinoSession extends BaseEntity {
    @PrimaryColumn({name: 'message_id', type: 'text'})
    messageId!: Snowflake

    @Column({name: 'server_id', type: 'text'})
    serverId!: Snowflake

    @Column({name: 'user_id', type: 'text'})
    userId!: Snowflake

    @Column({name: 'spins_left', type: 'integer', default: 0})
    spinsLeft: number = 0

    @Column({name: 'spins_bought', type: 'integer', default: 0})
    spinsBought: number = 0

    @Column({name: 'session_won', type: 'integer', default: 0})
    sessionWon: number = 0

    @Column({name: 'session_spent', type: 'integer', default: 0})
    sessionSpent: number = 0

    // Ставка за спин: задаётся при покупке и не меняется до конца сессии
    @Column({type: 'integer', default: 100})
    bet: number = 100

    // Спинов подряд без выигрыша — у каждой игры свой счётчик
    @Column({name: 'dry_streak', type: 'integer', default: 0})
    dryStreak: number = 0

    @Column({name: 'created_at', type: 'integer'})
    createdAt!: number
}
