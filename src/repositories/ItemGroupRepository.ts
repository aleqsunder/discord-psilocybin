import {Repository, SelectQueryBuilder} from 'typeorm'
import {ItemGroup} from '../entities/psilocybin/ItemGroup'
import {Psilocybin} from '../database/psilocybin'

export interface ItemGroupRepositoryFilter {
	serverId?: SnowflakeOrNull
	name?: string
}

function filterItemGroupsList(qb: SelectQueryBuilder<ItemGroup>, filter: ItemGroupRepositoryFilter): SelectQueryBuilder<ItemGroup> {
	if (filter.serverId) {
		qb.andWhere('group.server_id = :serverId', {serverId: filter.serverId})
	}

	if (filter.name) {
		qb.andWhere('group.name LIKE :name', {name: `%${filter.name}%`})
	}

	return qb
}

class ItemGroupRepository extends Repository<ItemGroup> {
	getListBuilder(filter: ItemGroupRepositoryFilter = {}): SelectQueryBuilder<ItemGroup> {
		return filterItemGroupsList(this.createQueryBuilder('group').distinct(), filter)
	}

	getList(page: number = 1, countPerPage: number = 30, filter: ItemGroupRepositoryFilter = {}): Promise<ItemGroup[]> {
		return this.getListBuilder(filter)
			.skip((page - 1) * countPerPage)
			.take(countPerPage)
			.getMany()
	}

	async getListCount(filter: ItemGroupRepositoryFilter = {}): Promise<number> {
		const {count = 0} = await this.getListBuilder(filter)
			.select('COUNT(group.id)', 'count')
			.getRawOne() as {count: number}

		return count
	}

	getOneByRandom(filter: ItemGroupRepositoryFilter = {}): Promise<ItemGroup|null> {
		return this.getListBuilder(filter)
			.innerJoinAndSelect('group.items', 'item')
			.innerJoinAndSelect('item.quality', 'quality')
			.take(1)
			.orderBy('random()')
			.getOne()
	}
}

export default new ItemGroupRepository(ItemGroup, Psilocybin.createEntityManager())
