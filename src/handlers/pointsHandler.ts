import {ChatInputCommandInteraction, User, UserContextMenuCommandInteraction} from 'discord.js'
import {MuhomorUser} from '../entities/MuhomorUser'
import MuhomorUserRepository from '../repositories/MuhomorUserRepository'
import {formatPoints} from '../utils/formatUtils'
import {POINTS_EMOJI} from '../constants'

async function formatUserPointsAction(
    interaction: ChatInputCommandInteraction|UserContextMenuCommandInteraction,
    user: User
): Promise<void> {
    const muhomorUser: MuhomorUser|null = await MuhomorUserRepository.getUserById(user.id, interaction.guildId!)

    await interaction.editReply({
        content: `<@${user.id}> - ${formatPoints(muhomorUser?.points ?? 0)} ${POINTS_EMOJI}`,
        allowedMentions: {parse: []},
    })
}

export async function showUserPointsHandler(interaction: UserContextMenuCommandInteraction): Promise<void> {
    await formatUserPointsAction(interaction, interaction.targetUser)
}

export async function pointsHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()

    const user: User = interaction.options.getUser('user') ?? interaction.user
    await formatUserPointsAction(interaction, user)
}
