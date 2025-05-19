import {help} from './help'
import {caseCommand} from './case'
import {item} from './item'
import {quality} from './quality'
import {user} from './user'
import {test} from './test'
import {play} from './play'

export const list: PsilocybinCommand[] = [
    help,
    caseCommand,
    item,
    quality,
    user,
    test,
    play,
]
