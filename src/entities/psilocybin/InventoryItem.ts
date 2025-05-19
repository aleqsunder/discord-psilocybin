import {Entity, PrimaryColumn, ManyToOne, BaseEntity, JoinColumn, PrimaryGeneratedColumn} from 'typeorm'
import {Inventory} from './Inventory'
import {Item} from './Item'

@Entity('psilocybin_inventory_items')
export class InventoryItem extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number

	@PrimaryColumn({name: 'inventory_id', type: 'integer'})
	inventoryId!: number

	@ManyToOne(() => Inventory, inventory => inventory.items)
	@JoinColumn({name: 'inventory_id'})
	inventory!: Inventory

	@PrimaryColumn({name: 'item_id', type: 'integer'})
	itemId!: number

	@ManyToOne(() => Item, item => item.inventories)
	@JoinColumn({name: 'item_id'})
	item!: Item
}
