import {ChatInputCommandInteraction, User} from 'discord.js'
import {MuhomorUser} from '../entities/MuhomorUser'
import MuhomorUserRepository from '../repositories/MuhomorUserRepository'
import {formatPoints} from '../utils/formatUtils'
import {POINTS_EMOJI} from '../constants'

export async function pointsHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()

    const user: User = interaction.options.getUser('user') ?? interaction.user
    const muhomorUser: MuhomorUser|null = await MuhomorUserRepository.getUserById(user.id, interaction.guildId!)

    await interaction.editReply({
        content: `<@${user.id}> - ${formatPoints(muhomorUser?.points ?? 0)} ${POINTS_EMOJI}`,
        allowedMentions: {parse: []},
    })
}
