import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js'
import {AbstractEffect} from './abstractEffect'
import {createRoleHandler} from '../handlers/user/modals/createRole'
import ModalSubmitError from '../errors/ModalSubmitError'

export class CreateRoleEffect extends AbstractEffect {
    removeAfterUse = true

    name = 'Создание роли'
    shortName = '🎨'
    description = 'Создаёт кастомную роль по желанию пользователя'

    async onEffect(interaction: ChatInputCommandInteraction): Promise<void> {
        const customId: string = crypto.randomUUID()
        const modal = new ModalBuilder()
            .setCustomId(customId)
            .setTitle('Создание роли')

        const nameInput = new TextInputBuilder()
            .setCustomId('name')
            .setLabel('Название роли')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const colorInput = new TextInputBuilder()
            .setCustomId('color')
            .setLabel('Цвет роли (HEX, например #FF5733)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput),
        )

        await interaction.showModal(modal)
        const modalInteraction: ModalSubmitInteraction = await interaction.awaitModalSubmit({
            time: 3e5,
            filter: (i: ModalSubmitInteraction) =>
                i.customId === customId && i.user.id === interaction.user.id,
        })

        if (!modalInteraction.isModalSubmit()) {
            throw new ModalSubmitError('Пользователь не создал роль за 5 минут')
        }

        await createRoleHandler(modalInteraction)
    }
}
