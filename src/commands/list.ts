import {help} from './help'
import {caseCommand} from './case'
import {item} from './item'
import {quality} from './quality'
import {user} from './user'
import {test} from './test'
import {play} from './play'
import {randomCaseShortcut} from './case/case'
import {settings} from './settings'

export const list: PsilocybinCommand[] = [
    help,
    caseCommand,
    randomCaseShortcut,
    item,
    quality,
    user,
    test,
    play,
    settings,
]
