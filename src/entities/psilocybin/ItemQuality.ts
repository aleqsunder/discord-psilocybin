import {Entity, PrimaryGeneratedColumn, Column, OneToOne, BaseEntity} from 'typeorm'
import {Item} from './Item'
import {Snowflake} from 'discord.js'

@Entity('psilocybin_item_qualities')
export class ItemQuality extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number

	@Column({name: 'server_id', type: 'text'})
	serverId!: Snowflake

	@Column('text')
	name!: string

	@Column({name: 'color_hex', type: 'text'})
	colorHex!: string

	@Column({type: 'real', default: 100})
	chance!: number

	@Column({name: 'is_default', type: 'boolean'})
	isDefault!: boolean

	@OneToOne(() => Item, item => item.quality)
	item!: Item
}
