import {Collection, ColorResolvable, GuildMember, ModalSubmitInteraction, Role} from 'discord.js'
import {validateColor, validateName} from '../../../utils/validateUtils'

export async function createRoleHandler(interaction: ModalSubmitInteraction) {
    const name: string = interaction.fields.getTextInputValue('name').trim()
    const color: string = interaction.fields.getTextInputValue('color').trim()

    validateName(name)
    validateColor(color)

    const member = interaction.member as GuildMember
    const userRoles: Collection<string, Role> = member.roles.cache
        .filter(role => role.id !== interaction.guildId!)
        .sort((a, b) => b.position - a.position)

    const baseRole: Role|null = userRoles.last() || null
    const newRole: Role = await interaction.guild!.roles.create({
        name,
        color: color as ColorResolvable,
        reason: `Создано пользователем ${interaction.user.tag} из эффекта`
    })

    if (baseRole && newRole.position < baseRole.position) {
        await newRole.setPosition(baseRole.position, {
            reason: 'Перемещение роли выше базовой из эффекта'
        })
    }

    await member.roles.add(newRole)
    await interaction.reply('Роль успешно создана!')
}
