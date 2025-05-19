import {ChatInputCommandInteraction} from 'discord.js'
import {isAdmin} from '../../utils/permissionUtils'

export async function testHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!isAdmin(interaction)) {
        await interaction.reply(`У вас недостаточно прав для выполнения данной команды`)
        return
    }

    await interaction.reply('Тут пока пусто!')
}
