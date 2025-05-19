import {Item} from '../entities/psilocybin/Item'
import {Repository, SelectQueryBuilder} from 'typeorm'
import {Psilocybin} from '../database/psilocybin'

export interface ItemRepositoryFilter {
	serverId?: SnowflakeOrNull
	userId?: SnowflakeOrNull
	name?: string
	groupBy?: string
	effect?: string
}

function filterItemsList(qb: SelectQueryBuilder<Item>, filter: ItemRepositoryFilter): SelectQueryBuilder<Item> {
	if (filter.serverId) {
		qb.andWhere('i.server_id = :serverId', {serverId: filter.serverId})
	}

	if (filter.userId) {
		qb.innerJoin('i.inventories', 'inventories')
		qb.innerJoin('inventories.inventory', 'inventory')
		qb.andWhere('inventory.user_id = :userId', {userId: filter.userId})
	}

	if (filter.name) {
		qb.andWhere('i.name LIKE :name', {name: `%${filter.name}%`})
	}

	if (filter.groupBy) {
		qb.groupBy(`i.${filter.groupBy}`)
	}

	return qb
}

class ItemRepository extends Repository<Item> {
	getListBuilder(filter: ItemRepositoryFilter = {}): SelectQueryBuilder<Item> {
		return filterItemsList(this.createQueryBuilder('i').distinct(), filter)
	}

	getList(page: number = 1, countPerPage: number = 30, filter: ItemRepositoryFilter = {}): Promise<Item[]> {
		return this.getListBuilder(filter)
			.leftJoinAndSelect('i.quality', 'q')
			.skip((page - 1) * countPerPage)
			.take(countPerPage)
			.getMany()
	}

	async getListCount(filter: ItemRepositoryFilter = {}): Promise<number> {
		const {count = 0} = await this.getListBuilder(filter)
			.select('COUNT(i.id)', 'count')
			.getRawOne() as {count: number}

		return count
	}
}

export default new ItemRepository(Item, Psilocybin.createEntityManager())
