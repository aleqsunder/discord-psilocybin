import 'reflect-metadata'

import {Database, open} from 'sqlite'
import sqlite3 from 'sqlite3'
import {SqliteConnectionOptions} from 'typeorm/driver/sqlite/SqliteConnectionOptions'
import {DataSource} from 'typeorm'
import {PSILOCYBIN_DB_PATH} from '../constants'
import path from 'path'
import process from 'process'

import {Inventory} from '../entities/psilocybin/Inventory'
import {InventoryItem} from '../entities/psilocybin/InventoryItem'
import {Item} from '../entities/psilocybin/Item'
import {ItemGroup} from '../entities/psilocybin/ItemGroup'
import {ItemQuality} from '../entities/psilocybin/ItemQuality'
import {Setting} from '../entities/psilocybin/Setting'
import {SnakeNamingStrategy} from 'typeorm-naming-strategies'

const entitiesList: Array<object> = [
	Inventory,
	InventoryItem,
	Item,
	ItemGroup,
	ItemQuality,
	Setting,
]
export const Psilocybin = new DataSource({
	type: 'sqlite',
	database: path.join(process.cwd(), 'db/psilocybin.db'),
	entities: entitiesList,
	synchronize: false,
	entitySkipConstructor: true,
	namingStrategy: new SnakeNamingStrategy(),
} as SqliteConnectionOptions)

export let psilocybin: Database
export async function initializePsilocybin() {
	psilocybin = await open({
		filename: path.join(PSILOCYBIN_DB_PATH),
		driver: sqlite3.Database
	})

	try {
		await psilocybin.migrate({
			migrationsPath: path.join(process.cwd(), 'migrations/psilocybin')
		})
	} catch (error) {
		console.log('Ошибка миграции:', error)
	}

	await Psilocybin.initialize()
}
