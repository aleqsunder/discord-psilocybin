import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, OneToMany, BaseEntity, JoinColumn} from 'typeorm'
import {ItemGroup} from './ItemGroup'
import {ItemQuality} from './ItemQuality'
import {InventoryItem} from './InventoryItem'
import {Snowflake} from 'discord.js'
import {Image, loadImage} from '@napi-rs/canvas'
import {AbstractEffect} from '../../effects/abstractEffect'
import {EffectFactory} from '../../factories/EffectFactory'
import {resolveImagePath} from '../../utils/imageUtils'
import {DEFAULT_ITEM_IMAGE_PATH} from '../../constants'

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

	@ManyToOne(() => ItemGroup, group => group.items, {nullable: true, onDelete: 'SET NULL'})
	@JoinColumn({name: 'group_id'})
	group!: ItemGroup|null

	@OneToOne(() => ItemQuality, quality => quality.item, {nullable: true, onDelete: 'SET NULL'})
	@JoinColumn({name: 'quality_id'})
	quality!: ItemQuality|null

	@Column({type: 'text', nullable: true})
	effect!: string|null

	@Column({type: 'text', name: 'image_path', nullable: false})
	imagePath!: string

	@OneToMany(() => InventoryItem, inventoryItem => inventoryItem.item, {cascade: true})
	inventories!: InventoryItem[]

	public getImagePath(): string {
		return resolveImagePath(this.imagePath, DEFAULT_ITEM_IMAGE_PATH)
	}

	public async getImage(): Promise<Image> {
		return await loadImage(this.getImagePath())
	}

	public getEffect(): AbstractEffect|null {
		if (!this.effect) {
			return null
		}

		return EffectFactory.createEffect(this.effect)
	}
}
