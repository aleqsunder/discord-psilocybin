import {AbstractEffect} from '../effects/abstractEffect'
import {TempInviteGenerate} from '../effects/tempInviteGenerate'
import {MusicEffect} from '../effects/musicEffect'
import {DoubleCaseCostSell} from '../effects/doubleCaseCostSell'
import {InviteEffect} from '../effects/inviteEffect'

export enum EffectType {
    TempInviteGenerate = 'TempInviteGenerate',
    MusicEffect = 'MusicEffect',
    DoubleCaseCostSell = 'DoubleCaseCostSell',
    InviteEffect = 'InviteEffect',
}

export const EffectMap: Record<EffectType, typeof AbstractEffect> = {
    [EffectType.TempInviteGenerate]: TempInviteGenerate,
    [EffectType.MusicEffect]: MusicEffect,
    [EffectType.DoubleCaseCostSell]: DoubleCaseCostSell,
    [EffectType.InviteEffect]: InviteEffect,
}

export class EffectFactory {
    static createEffect(effect: string): AbstractEffect {
        switch (effect) {
            case EffectType.TempInviteGenerate: return new TempInviteGenerate()
            case EffectType.MusicEffect: return new MusicEffect()
            case EffectType.DoubleCaseCostSell: return new DoubleCaseCostSell()
            case EffectType.InviteEffect: return new InviteEffect()
            default:
                throw new Error(`Неизвестный эффект: ${effect}`)
        }
    }
}
