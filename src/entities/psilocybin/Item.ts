import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, OneToMany, BaseEntity, JoinColumn} from 'typeorm'
import {ItemGroup} from './ItemGroup'
import {ItemQuality} from './ItemQuality'
import {InventoryItem} from './InventoryItem'
import {Snowflake} from 'discord.js'
import {Image, loadImage} from '@napi-rs/canvas'
import {AbstractEffect} from '../../effects/abstractEffect'
import {EffectFactory} from '../../factories/EffectFactory'

@Entity('psilocybin_items')
export class Item extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number

	@Column({name: 'server_id', type: 'text'})
	serverId!: Snowflake

	@Column('text')
	name!: string

	@Column({type: 'text', length: 1000})
	description!: string

	@ManyToOne(() => ItemGroup, group => group.items, {nullable: true})
	@JoinColumn({name: 'group_id'})
	group!: ItemGroup|null

	@OneToOne(() => ItemQuality, quality => quality.item, {nullable: true})
	@JoinColumn({name: 'quality_id'})
	quality!: ItemQuality|null

	@Column({type: 'text', nullable: true})
	effect!: string|null

	@Column({type: 'text', name: 'image_path', nullable: false})
	imagePath!: string

	@OneToMany(() => InventoryItem, inventoryItem => inventoryItem.item)
	inventories!: InventoryItem[]

	public async getImage(): Promise<Image> {
		return await loadImage(this.imagePath)
	}

	public getEffect(): AbstractEffect|null {
		if (!this.effect) {
			return null
		}

		return EffectFactory.createEffect(this.effect)
	}
}
