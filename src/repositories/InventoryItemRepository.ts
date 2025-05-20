import {Repository, SelectQueryBuilder} from 'typeorm'
import {InventoryItem} from '../entities/psilocybin/InventoryItem'
import {ItemRepositoryFilter} from './ItemRepository'
import {Psilocybin} from '../database/psilocybin'

function filterItemsList(qb: SelectQueryBuilder<InventoryItem>, filter: ItemRepositoryFilter): SelectQueryBuilder<InventoryItem> {
    if (filter.id) {
        qb.andWhere('inv_i.id = :id', {id: filter.id})
    }

    if (filter.itemId) {
        qb.andWhere('i.id = :itemId', {itemId: filter.itemId})
    }

    if (filter.serverId) {
        qb.andWhere('i.server_id = :serverId', {serverId: filter.serverId})
    }

    if (filter.userId) {
        qb.innerJoin('inv_i.inventory', 'inventory')
        qb.andWhere('inventory.user_id = :userId', {userId: filter.userId})
    }

    if (filter.name) {
        qb.andWhere('i.name LIKE :name', {name: `%${filter.name}%`})
    }

    if (filter.groupBy) {
        qb.groupBy(`i.${filter.groupBy}`)
    }

    if (filter.effect) {
        qb.andWhere('i.effect = :effect', {effect: filter.effect})
    }

    return qb
}

class InventoryItemRepository extends Repository<InventoryItem> {
    getListBuilder(filter: ItemRepositoryFilter = {}): SelectQueryBuilder<InventoryItem> {
        return filterItemsList(
            this.createQueryBuilder('inv_i')
                .leftJoinAndSelect('inv_i.item', 'i')
                .distinct(),
            filter
        )
    }

    getList(page: number = 1, countPerPage: number = 30, filter: ItemRepositoryFilter = {}): Promise<InventoryItem[]> {
        return this.getListBuilder(filter)
            .leftJoinAndSelect('i.quality', 'q')
            .skip((page - 1) * countPerPage)
            .take(countPerPage)
            .getMany()
    }

    async getListCount(filter: ItemRepositoryFilter = {}): Promise<number> {
        const {count = 0} = await this.getListBuilder(filter)
            .select('COUNT(inv_i.id)', 'count')
            .getRawOne() as {count: number}

        return count
    }

    getOneByFilter(filter: ItemRepositoryFilter = {}): Promise<InventoryItem|null> {
        return this.getListBuilder(filter)
            .leftJoinAndSelect('i.group', 'group')
            .leftJoinAndSelect('i.quality', 'quality')
            .getOne()
    }
}

export default new InventoryItemRepository(InventoryItem, Psilocybin.createEntityManager())
