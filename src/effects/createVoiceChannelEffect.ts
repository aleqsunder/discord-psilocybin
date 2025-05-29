import {AbstractEffect} from './abstractEffect'
import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js'
import {createVoiceChannelHandler} from '../handlers/user/modals/createVoiceChannel'
import ModalSubmitError from '../errors/ModalSubmitError'

export class CreateVoiceChannelEffect extends AbstractEffect {
    removeAfterUse = true

    name = 'Создание голосового канала'
    shortName = '🎙️'
    description = 'Создаёт голосовой канал, где вы — модератор'

    async onEffect(interaction: ChatInputCommandInteraction): Promise<void> {
        const customId: string = crypto.randomUUID()
        const modal = new ModalBuilder()
            .setCustomId(customId)
            .setTitle('Создание голосового канала')

        const nameInput = new TextInputBuilder()
            .setCustomId('name')
            .setLabel('Название канала')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput)
        )

        await interaction.showModal(modal)
        const modalInteraction: ModalSubmitInteraction = await interaction.awaitModalSubmit({
            time: 3e5,
            filter: (i: ModalSubmitInteraction) =>
                i.customId === customId && i.user.id === interaction.user.id
        })

        if (!modalInteraction.isModalSubmit()) {
            throw new ModalSubmitError('Пользователь не создал голосовой канал за 5 минут')
        }

        await createVoiceChannelHandler(modalInteraction)
    }
}
