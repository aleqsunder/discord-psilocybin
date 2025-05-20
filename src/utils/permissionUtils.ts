import {ChatInputCommandInteraction, Interaction, PermissionsBitField} from 'discord.js'

export function isAdmin(interaction: Interaction|ChatInputCommandInteraction): boolean {
    if (!interaction.inGuild() || !interaction.member) {
        return false
    }

    return interaction.memberPermissions.has(PermissionsBitField.Flags.KickMembers)
}
