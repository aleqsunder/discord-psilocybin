import {ChatInputCommandInteraction} from "discord.js"
import {jsonServerCommands} from "../commands"

const AVAILABLE_COMMANDS = 'Команды:'
const ADDITIONAL_INFO = `Для получения информации о конкретной команде введите /help [:command]`

function commandMap(command: PsilocybinCommand, commandName: string|null = null): string {
    let commandOptionsName: string[] = []
    let commandOptionsDescription: string[] = []

    let row = '**/'
    if (typeof command.options !== 'undefined') {
        command.options.forEach((option: PsilocybinCommand) => {
            commandOptionsName.push(`[${option.name}]`)
            commandOptionsDescription.push(`**[${option.name}]**: ${option.description}`)
        })

        if (commandName) {
            row += commandName + ' '
        }

        row += `${command.name}** ${commandOptionsName.join(' ')} - ${command.description}`
        if (commandOptionsDescription.length > 0) {
            row += `\n-# ${commandOptionsDescription.join('\n-# ')}\n`
        }
    }

    return row
}

export async function helpHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()

    let command: PsilocybinCommand|null = null
    const commandName: string|null = interaction.options.getString('command')
    if (typeof commandName === 'string') {
        let filteredCommandList: PsilocybinCommand[] = jsonServerCommands.filter(command => command.name.includes(commandName))
        if (filteredCommandList.length === 0) {
            await interaction.editReply(`Команда ${commandName} не существует в списке`)
            return
        }

        command = filteredCommandList[0]
    }

    if (typeof commandName === 'string' && command === null) {
        await interaction.editReply('У команды нет сабкомманд или переменных')
        return
    }

    const commandList = command !== null ? command.options as PsilocybinCommand[] : jsonServerCommands
    const helpMessage = commandList
        .map(cmd => commandMap(cmd, command !== null ? command.name : null))
        .join('\n')

    await interaction.editReply({
        content: `## ${AVAILABLE_COMMANDS}\n${helpMessage}\n### ${ADDITIONAL_INFO}`
    })
}
