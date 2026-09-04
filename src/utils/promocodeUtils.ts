import {ChatInputCommandInteraction, ModalBuilder, ModalSubmitInteraction} from 'discord.js'
import {Promocode} from '../entities/psilocybin/Promocode'

export const PROMOCODE_COLOR: number = 0x5865F2
export const PROMOCODE_MODAL_TIMEOUT: number = 3e5

export function formatPromocodeRow(promocode: Promocode): string {
    return `**${promocode.name}** — ${promocode.money} поинтов\n\`${promocode.code}\``
}

export async function showPromocodeModal(
    interaction: ChatInputCommandInteraction,
    modal: ModalBuilder,
    customId: string,
): Promise<ModalSubmitInteraction|null> {
    await interaction.showModal(modal)

    try {
        return await interaction.awaitModalSubmit({
            time: PROMOCODE_MODAL_TIMEOUT,
            filter: (i: ModalSubmitInteraction) =>
                i.customId === customId && i.user.id === interaction.user.id,
        })
    } catch (e) {
        return null
    }
}
