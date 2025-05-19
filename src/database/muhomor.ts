import 'reflect-metadata'

import {Database, open} from 'sqlite'
import sqlite3 from 'sqlite3'
import {SqliteConnectionOptions} from "typeorm/driver/sqlite/SqliteConnectionOptions"
import {DataSource} from 'typeorm'
import path from 'path'
import {MUHOMOR_DB_PATH} from '../constants'

import {MuhomorUser} from '../entities/MuhomorUser'

const muhomorEntitiesList: Array<object> = [MuhomorUser]
export const Muhomor = new DataSource({
	type: 'sqlite',
	database: path.join(MUHOMOR_DB_PATH),
	entities: muhomorEntitiesList,
	synchronize: true,
	entitySkipConstructor: true,
} as SqliteConnectionOptions)

export let muhomor: Database
export async function initializeMuhomor() {
	muhomor = await open({
		filename: path.join(MUHOMOR_DB_PATH),
		driver: sqlite3.Database
	})

	try {
		await Muhomor.initialize()
	} catch (error) {
		console.log('Ошибка миграции:', error)
	}
}
