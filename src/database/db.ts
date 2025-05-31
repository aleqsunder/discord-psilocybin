import {initializePsilocybin} from './psilocybin'
import {initializeMuhomor} from './muhomor'

export async function initializeDatabase() {
    try {
        await initializeMuhomor()
        await initializePsilocybin()

        console.log('БД инициализировано')
    } catch (error) {
        console.error('Произошла ошибка инициализации БД:', error)
        process.exit(1)
    }
}
