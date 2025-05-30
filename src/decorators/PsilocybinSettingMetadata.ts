import 'reflect-metadata'
import {Column} from 'typeorm'

export function PsilocybinSetting(description: string) {
    return function (target: any, propertyKey: string | symbol) {
        Column({description})(target, propertyKey)
    }
}
