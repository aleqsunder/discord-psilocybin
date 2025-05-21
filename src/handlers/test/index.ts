import {ChatInputCommandInteraction} from 'discord.js'
import {isAdmin} from '../../utils/permissionUtils'

export async function testHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()

    if (!isAdmin(interaction)) {
        await interaction.editReply(`У вас недостаточно прав для выполнения данной команды`)
        return
    }

    await interaction.editReply('Тут пока пусто!')
}
