import {ChatInputCommandInteraction, EmbedBuilder, MessageFlagsBitField} from 'discord.js'
import {Promocode} from '../../entities/psilocybin/Promocode'
import PromocodeRepository from '../../repositories/PromocodeRepository'
import {formatPromocodeRow, PROMOCODE_COLOR} from '../../utils/promocodeUtils'

const MAX_ACTIVE_SHOWN: number = 20
const MAX_ACTIVATED_SHOWN: number = 5

function formatActiveSection(promocodes: Promocode[]): string {
    if (promocodes.length === 0) {
        return 'Активных промокодов нет'
    }

    const rows: string[] = promocodes
        .slice(0, MAX_ACTIVE_SHOWN)
        .map(formatPromocodeRow)

    const hidden: number = promocodes.length - rows.length
    if (hidden > 0) {
        rows.push(`-# …и ещё ${hidden}`)
    }

    return rows.join('\n\n')
}

function formatActivatedSection(promocodes: Promocode[]): string {
    const rows: string[] = promocodes
        .slice(0, MAX_ACTIVATED_SHOWN)
        .map(promocode => `~~${promocode.name} — ${promocode.money} поинтов~~ · <@${promocode.activatedById}>`)

    const hidden: number = promocodes.length - rows.length
    if (hidden > 0) {
        rows.push(`-# …и ещё ${hidden}`)
    }

    return rows.join('\n')
}

export async function listPromocodeHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({flags: MessageFlagsBitField.Flags.Ephemeral})

    const promocodes: Promocode[] = await PromocodeRepository.getListByCreator(
        interaction.user.id,
        interaction.guildId!,
    )

    if (promocodes.length === 0) {
        await interaction.editReply('Вы ещё не создавали промокоды')
        return
    }

    const active: Promocode[] = promocodes.filter(promocode => !promocode.isActivated())
    const activated: Promocode[] = promocodes.filter(promocode => promocode.isActivated())
    const reserved: number = active.reduce((sum, promocode) => sum + promocode.money, 0)

    const embed = new EmbedBuilder()
        .setTitle('🎟️ Ваши промокоды')
        .setDescription(formatActiveSection(active))
        .setFooter({text: `Активных: ${active.length} на ${reserved} поинтов · Активировано: ${activated.length}`})
        .setColor(PROMOCODE_COLOR)

    if (activated.length > 0) {
        embed.addFields({name: 'Уже активированы', value: formatActivatedSection(activated)})
    }

    await interaction.editReply({embeds: [embed]})
}
