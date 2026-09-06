import {help} from './help'
import {caseCommand} from './case'
import {randomCaseShortcut} from './random-case'
import {item} from './item'
import {inventory} from './inventory'
import {promo} from './promo'
import {points} from './points'
import {top} from './top'
import {casino} from './casino'
import {play} from './play'
import {admin} from './admin'
import {settings} from './admin/settings'
import {summary} from './summary'

export const serverCommandList = [
    help,
    caseCommand,
    randomCaseShortcut,
    item,
    inventory,
    promo,
    points,
    top,
    casino,
    play,
    summary,
    admin,
    settings,
]
