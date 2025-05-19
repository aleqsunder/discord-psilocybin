import {Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity} from 'typeorm'
import {Item} from './Item'
import {Snowflake} from 'discord.js'
import {Image, loadImage} from '@napi-rs/canvas'

@Entity('psilocybin_item_groups')
export class ItemGroup extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number

	@Column({name: 'server_id', type: 'text'})
	serverId!: Snowflake

	@Column('text')
	name!: string

	@Column({type: 'text', length: 1000})
	description!: string

	@Column({name: 'is_default', type: 'boolean'})
	isDefault!: boolean

	@Column({name: 'is_available_to_open', type: 'boolean'})
	isAvailableToOpen!: boolean

	@Column({name: 'cost', type: 'integer'})
	cost!: number

	@Column({type: 'text', name: 'image_path', nullable: false})
	imagePath!: string

	@OneToMany(() => Item, item => item.group)
	items!: Item[]

	public async getImage(): Promise<Image> {
		return await loadImage(this.imagePath)
	}
}
