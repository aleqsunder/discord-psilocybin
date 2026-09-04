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
import {MuhomorUser} from '../../entities/MuhomorUser'
import MuhomorUserRepository from '../../repositories/MuhomorUserRepository'
import {formatMoney} from '../../utils/formatUtils'
import {validatePromocodeMoney, validatePromocodeName} from '../../utils/validateUtils'
import {PROMOCODE_COLOR, showPromocodeModal} from '../../utils/promocodeUtils'

const NAME_MAX_LENGTH: number = 100

function buildModal(customId: string): ModalBuilder {
    const nameInput = new TextInputBuilder()
        .setCustomId('name')
        .setLabel('Название промокода')
        .setPlaceholder('Например, «Подарок за помощь»')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(NAME_MAX_LENGTH)
        .setRequired(true)

    const moneyInput = new TextInputBuilder()
        .setCustomId('money')
        .setLabel('Сумма (поинты)')
        .setPlaceholder('100')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)

    return new ModalBuilder()
        .setCustomId(customId)
        .setTitle('Создание промокода')
        .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(moneyInput),
        )
}

async function sendPromocodeToDirectMessages(promocode: Promocode, interaction: ModalSubmitInteraction): Promise<boolean> {
    const embed = new EmbedBuilder()
        .setTitle('🎟️ Промокод создан')
        .setDescription(`Отправьте этот код тому, кому предназначены поинты. Активируется командой \`/promo receive\`.`)
        .addFields(
            {name: 'Название', value: promocode.name},
            {name: 'Сумма', value: `${promocode.money} поинтов`, inline: true},
            {name: 'Сервер', value: interaction.guild?.name ?? '—', inline: true},
            {name: 'Код', value: `\`${promocode.code}\``},
        )
        .setColor(PROMOCODE_COLOR)

    try {
        await interaction.user.send({embeds: [embed]})
        return true
    } catch (e) {
        // Личные сообщения могут быть закрыты — код всё ещё доступен через /promo list
        return false
    }
}

export async function createPromocodeHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const customId: string = crypto.randomUUID()
    const modalInteraction: ModalSubmitInteraction|null = await showPromocodeModal(
        interaction,
        buildModal(customId),
        customId,
    )

    if (!modalInteraction) {
        return
    }

    await modalInteraction.deferReply({flags: MessageFlagsBitField.Flags.Ephemeral})

    const name: string = modalInteraction.fields.getTextInputValue('name').trim()
    const money: number = Number(modalInteraction.fields.getTextInputValue('money').trim().replace(',', '.'))

    try {
        validatePromocodeName(name)
        validatePromocodeMoney(money)
    } catch (e) {
        await modalInteraction.editReply((e as Error).message)
        return
    }

    const user: MuhomorUser = await MuhomorUserRepository.getCurrentUser(modalInteraction)
    if (user.points < money) {
        await modalInteraction.editReply(`Недостаточно поинтов: на балансе ${user.points}, а нужно ${money}`)
        return
    }

    const pointsBefore: number = user.points
    user.points = formatMoney(user.points - money)
    await user.save()

    const promocode = new Promocode()
    promocode.serverId = modalInteraction.guildId!
    promocode.code = crypto.randomUUID()
    promocode.name = name
    promocode.money = money
    promocode.creatorId = modalInteraction.user.id
    promocode.createdAt = Date.now()

    try {
        await promocode.save()
    } catch (error) {
        console.error('Не удалось создать промокод:', error)

        user.points = pointsBefore
        await user.save()

        await modalInteraction.editReply('Не удалось создать промокод, поинты возвращены на баланс')
        return
    }

    const isDelivered: boolean = await sendPromocodeToDirectMessages(promocode, modalInteraction)
    const balance: string = `Ваш баланс: ${user.points}`

    await modalInteraction.editReply(isDelivered
        ? `Промокод «${name}» на ${money} поинтов создан, код отправлен вам в личные сообщения. ${balance}`
        : `Промокод «${name}» на ${money} поинтов создан, но личные сообщения закрыты — код можно посмотреть в \`/promo list\`. ${balance}`)
}
