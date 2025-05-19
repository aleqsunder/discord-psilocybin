import {ItemQuality} from '../entities/psilocybin/ItemQuality'
import {Trim} from '../decorators/trim'
import {FindOptionsWhere, Repository} from 'typeorm'
import {Psilocybin} from '../database/psilocybin'

class ItemQualityRepository extends Repository<ItemQuality> {
	searchByName(@Trim name: string = ''): Promise<ItemQuality[]> {
		const qb = this.createQueryBuilder('q')
		if (name.length > 0) {
			qb.where('q.name LIKE :name', {name: `%${name}%`})
		}

		return qb.getMany()
	}

	getItemQualityByIdOrDefault(id: string|null): Promise<ItemQuality|null> {
		let options: FindOptionsWhere<ItemQuality> = {isDefault: true}
		if (id) {
			options = {id: Number(id)}
		}

		return this.findOneBy(options)
	}
}

export default new ItemQualityRepository(ItemQuality, Psilocybin.createEntityManager())
