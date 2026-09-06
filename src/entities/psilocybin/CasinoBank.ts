import {BaseEntity, Column, Entity, PrimaryColumn} from 'typeorm'
import {Snowflake} from 'discord.js'

// Банк один на сервер: проигрыши одних игроков наполняют его, выигрыши других — опустошают
@Entity('psilocybin_casino_bank')
export class CasinoBank extends BaseEntity {
    @PrimaryColumn({name: 'server_id', type: 'text'})
    serverId!: Snowflake

    @Column({name: 'total_spent', type: 'integer', default: 0})
    totalSpent: number = 0

    @Column({name: 'total_won', type: 'integer', default: 0})
    totalWon: number = 0

    // Сколько банк сейчас в плюсе. Отрицательное значение — игроки забрали больше, чем занесли
    public getReserve(): number {
        return this.totalSpent - this.totalWon
    }
}
