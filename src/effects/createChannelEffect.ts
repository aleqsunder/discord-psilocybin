import {AbstractEffect} from './abstractEffect'
import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js'
import {createChannelHandler} from '../handlers/user/modals/createChannel'
import ModalSubmitError from '../errors/ModalSubmitError'

export class CreateChannelEffect extends AbstractEffect {
    removeAfterUse = true

    name = 'Создание канала'
    shortName = '💬'
    description = 'Создаёт канал пользователя, где вы - модератор'

    async onEffect(interaction: ChatInputCommandInteraction): Promise<void> {
        const customId: string = crypto.randomUUID()
        const modal = new ModalBuilder()
            .setCustomId(customId)
            .setTitle('Создание канала')

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
            throw new ModalSubmitError('Пользователь не создал канал за 5 минут')
        }

        await createChannelHandler(modalInteraction)
    }
}
