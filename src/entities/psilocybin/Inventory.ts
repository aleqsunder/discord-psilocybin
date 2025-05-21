import {Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity} from 'typeorm'
import {InventoryItem} from './InventoryItem'
import {Snowflake} from 'discord.js'

@Entity('psilocybin_inventory')
export class Inventory extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number

	@Column({name: 'server_id', type: 'text'})
	serverId!: Snowflake

	@Column({name: 'user_id', type: 'text'})
	userId!: Snowflake

	@OneToMany(() => InventoryItem, item => item.inventory, {cascade: true})
	items!: InventoryItem[]
}
