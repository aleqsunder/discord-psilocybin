import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlagsBitField,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js'
import {Promocode} from '../../entities/psilocybin/Promocode'
import PromocodeRepository from '../../repositories/PromocodeRepository'
import {MuhomorUser} from '../../entities/MuhomorUser'
import MuhomorUserRepository from '../../repositories/MuhomorUserRepository'
import {formatMoney} from '../../utils/formatUtils'
import {PROMOCODE_COLOR, showPromocodeModal} from '../../utils/promocodeUtils'

const CODE_MAX_LENGTH: number = 36
const NOT_FOUND_MESSAGE: string = 'Промокод не найден или уже был активирован'

function buildModal(customId: string): ModalBuilder {
    const codeInput = new TextInputBuilder()
        .setCustomId('code')
        .setLabel('Промокод')
        .setPlaceholder('f47ac10b-58cc-4372-a567-0e02b2c3d479')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(CODE_MAX_LENGTH)
        .setRequired(true)

    return new ModalBuilder()
        .setCustomId(customId)
        .setTitle('Активация промокода')
        .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(codeInput))
}

export async function receivePromocodeHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const customId: string = crypto.randomUUID()
    const modalInteraction: ModalSubmitInteraction|null = await showPromocodeModal(
        interaction,
        buildModal(customId),
        customId,
    )

    if (!modalInteraction) {
        return
    }

    const code: string = modalInteraction.fields.getTextInputValue('code').trim().toLowerCase()
    const promocode: Promocode|null = await PromocodeRepository.getOneByCode(code, modalInteraction.guildId!)
    if (!promocode || promocode.isActivated()) {
        await modalInteraction.reply({
            content: NOT_FOUND_MESSAGE,
            flags: MessageFlagsBitField.Flags.Ephemeral,
        })
        return
    }

    const isActivated: boolean = await PromocodeRepository.activate(promocode, modalInteraction.user.id)
    if (!isActivated) {
        await modalInteraction.reply({
            content: NOT_FOUND_MESSAGE,
            flags: MessageFlagsBitField.Flags.Ephemeral,
        })
        return
    }

    const user: MuhomorUser = await MuhomorUserRepository.getCurrentUser(modalInteraction)
    user.points = formatMoney(user.points + promocode.money)
    await user.save()

    const embed = new EmbedBuilder()
        .setTitle('🎟️ Промокод активирован')
        .setDescription(`Промокод **${promocode.name}** активирован пользователем <@${modalInteraction.user.id}>`)
        .addFields(
            {name: 'Сумма', value: `${promocode.money} поинтов`, inline: true},
            {name: 'От кого', value: `<@${promocode.creatorId}>`, inline: true},
            {name: 'Кому', value: `<@${modalInteraction.user.id}>`, inline: true},
        )
        .setColor(PROMOCODE_COLOR)

    await modalInteraction.reply({embeds: [embed]})
}
