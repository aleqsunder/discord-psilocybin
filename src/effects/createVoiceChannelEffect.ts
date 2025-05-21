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

export class CreateVoiceChannelEffect extends AbstractEffect {
    removeAfterUse = true

    name = 'Создание голосового канала'
    shortName = '🎙️'
    description = 'Создаёт голосовой канал, где вы — модератор'

    async onEffect(interaction: ChatInputCommandInteraction): Promise<void> {
        const modal = new ModalBuilder()
            .setCustomId('create_voice_channel_effect')
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
            time: 60000,
            filter: (i: ModalSubmitInteraction) =>
                i.customId === 'create_voice_channel_effect' && i.user.id === interaction.user.id
        })

        if (!modalInteraction.isModalSubmit()) {
            return
        }

        await createVoiceChannelHandler(modalInteraction)
    }
}
