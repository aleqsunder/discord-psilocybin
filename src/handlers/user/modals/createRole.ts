import {Collection, ColorResolvable, GuildMember, ModalSubmitInteraction, Role} from 'discord.js'

function validateName(name: string): boolean {
    if (!name) {
        throw new Error('Название роли не может быть пустым')
    }
    if (name.length > 100) {
        throw new Error('Название роли не должно превышать 100 символов')
    }

    return true
}

function validateColor(color: string): boolean {
    const hexColorRegex = /^#?([A-Fa-f0-9]{6})$/
    if (!hexColorRegex.test(color)) {
        throw new Error('Цвет должен быть в формате HEX (например, #FF5733)')
    }

    return true
}

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
