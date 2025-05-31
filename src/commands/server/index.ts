import {help} from './help'
import {caseCommand} from './case'
import {randomCaseShortcut} from './random-case'
import {item} from './item'
import {inventory} from './inventory'
import {play} from './play'
import {admin} from './admin'
import {settings} from './admin/settings'

export const serverCommandList = [
    help,
    caseCommand,
    randomCaseShortcut,
    item,
    inventory,
    play,
    admin,
    settings,
]
