import {initializePsilocybin} from './psilocybin'
import {initializeMuhomor} from './muhomor'

export async function initializeDatabase() {
    await initializeMuhomor()
    await initializePsilocybin()
}
