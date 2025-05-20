import {ChannelType, GuildMember, ModalSubmitInteraction, PermissionFlagsBits} from 'discord.js'
import {validateName} from '../../../utils/validateUtils'

export async function createChannelHandler(interaction: ModalSubmitInteraction) {
    const name: string = interaction.fields.getTextInputValue('name').trim()
    validateName(name)

    const guild = interaction.guild!
    const member = interaction.member as GuildMember

    await guild.channels.create({
        name,
        type: ChannelType.GuildText,
        permissionOverwrites: [{
            id: member.id,
            allow: [
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.ManageRoles,
                PermissionFlagsBits.ManageWebhooks,
                PermissionFlagsBits.ManageThreads,
                PermissionFlagsBits.CreatePublicThreads,
                PermissionFlagsBits.CreatePrivateThreads,
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.SendTTSMessages,
            ]
        }],
        reason: `Создано пользователем ${interaction.user.tag} из эффекта`
    })

    await interaction.reply('Канал успешно создан!')
}
