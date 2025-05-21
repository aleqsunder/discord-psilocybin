import {AbstractEffect} from '../effects/abstractEffect'
import {TempInviteGenerate} from '../effects/tempInviteGenerate'
import {MusicEffect} from '../effects/musicEffect'
import {DoubleCaseCostSell} from '../effects/doubleCaseCostSell'
import {InviteEffect} from '../effects/inviteEffect'
import {CreateRoleEffect} from '../effects/createRoleEffect'
import {CreateChannelEffect} from '../effects/createChannelEffect'
import {CreateVoiceChannelEffect} from '../effects/createVoiceChannelEffect'

export enum EffectType {
    TempInviteGenerate = 'TempInviteGenerate',
    MusicEffect = 'MusicEffect',
    DoubleCaseCostSell = 'DoubleCaseCostSell',
    InviteEffect = 'InviteEffect',
    CreateRoleEffect = 'CreateRoleEffect',
    CreateChannelEffect = 'CreateChannelEffect',
    CreateVoiceChannelEffect = 'CreateVoiceChannelEffect',
}

export const EffectMap: Record<EffectType, typeof AbstractEffect> = {
    [EffectType.TempInviteGenerate]: TempInviteGenerate,
    [EffectType.MusicEffect]: MusicEffect,
    [EffectType.DoubleCaseCostSell]: DoubleCaseCostSell,
    [EffectType.InviteEffect]: InviteEffect,
    [EffectType.CreateRoleEffect]: CreateRoleEffect,
    [EffectType.CreateChannelEffect]: CreateChannelEffect,
    [EffectType.CreateVoiceChannelEffect]: CreateVoiceChannelEffect,
}

export class EffectFactory {
    static createEffect(effect: string): AbstractEffect {
        switch (effect) {
            case EffectType.TempInviteGenerate: return new TempInviteGenerate()
            case EffectType.MusicEffect: return new MusicEffect()
            case EffectType.DoubleCaseCostSell: return new DoubleCaseCostSell()
            case EffectType.InviteEffect: return new InviteEffect()
            case EffectType.CreateRoleEffect: return new CreateRoleEffect()
            case EffectType.CreateChannelEffect: return new CreateChannelEffect()
            case EffectType.CreateVoiceChannelEffect: return new CreateVoiceChannelEffect()
            default:
                throw new Error(`Неизвестный эффект: ${effect}`)
        }
    }
}
