import process from 'process'
import path from 'path'

if (typeof process.env.DISCORD_TOKEN === 'undefined') {
	throw new Error('Discord token is empty')
}

if (typeof process.env.MUHOMOR_DB_PATH === 'undefined') {
	throw new Error('Muhomor DB path is empty')
}

export const TOKEN: string = process.env.DISCORD_TOKEN
export const MUHOMOR_DB_PATH: string = process.env.MUHOMOR_DB_PATH
export const PSILOCYBIN_DB_PATH: string = 'db/psilocybin.db'

export const DEFAULT_IMAGES_CATALOG = path.join(process.cwd(), 'images').replace(/\\/g, '/')

export const DEFAULT_ITEMS_CATALOG = `${DEFAULT_IMAGES_CATALOG}/items`
export const DEFAULT_ITEM_IMAGE_PATH = `${DEFAULT_ITEMS_CATALOG}/default.png`

export const DEFAULT_GROUPS_CATALOG = `${DEFAULT_IMAGES_CATALOG}/groups`
export const DEFAULT_GROUP_IMAGE_PATH = `${DEFAULT_GROUPS_CATALOG}/default.png`

export const DEFAULT_DATA_CATALOG = `${DEFAULT_IMAGES_CATALOG}/data`
