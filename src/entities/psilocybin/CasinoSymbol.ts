import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from 'typeorm'
import {Snowflake} from 'discord.js'
import {resolveImagePath} from '../../utils/imageUtils'
import {DEFAULT_CASINO_IMAGE_PATH} from '../../constants'

// Фрукт казино: шанс выпадения задаётся весом, выплата — одна базовая в долях от ставки.
// Длина линии, форма и золотые клетки добавляют к ней множитель
@Entity('psilocybin_casino_symbols')
export class CasinoSymbol extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({name: 'server_id', type: 'text'})
    serverId!: Snowflake

    @Column({type: 'text'})
    name!: string

    @Column({name: 'image_path', type: 'text'})
    imagePath!: string

    @Column({type: 'real', default: 10})
    weight!: number

    @Column({type: 'real', default: 0})
    payout!: number

    public getImagePath(): string {
        return resolveImagePath(this.imagePath, DEFAULT_CASINO_IMAGE_PATH)
    }
}
