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

export class CreateChannelEffect extends AbstractEffect {
    removeAfterUse = true

    name = 'Создание канала'
    shortName = '💬'
    description = 'Создаёт канал пользователя, где он - модератор'

    async onEffect(interaction: ChatInputCommandInteraction): Promise<void> {
        const modal = new ModalBuilder()
            .setCustomId('create_channel_effect')
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
            time: 60000,
            filter: (i: ModalSubmitInteraction) =>
                i.customId === 'create_channel_effect' && i.user.id === interaction.user.id
        })

        if (!modalInteraction.isModalSubmit()) {
            return
        }

        await createChannelHandler(modalInteraction)
    }
}
