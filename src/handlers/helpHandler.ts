import {ChatInputCommandInteraction, GuildTextBasedChannel} from "discord.js"
import {jsonServerCommands} from "../commands"

const AVAILABLE_COMMANDS = 'Команды:'
const ADDITIONAL_INFO = `Для получения информации о конкретной команде введите /help [:command]`

// Лимит длины сообщения в дискорде
const MESSAGE_LIMIT = 2000

function commandMap(command: PsilocybinCommand, commandName: string|null = null): string {
    const options: PsilocybinCommand[] = command.options ?? []
    const optionsName: string[] = options.map(option => `[${option.name}]`)
    const optionsDescription: string[] = options.map(option => `**[${option.name}]**: ${option.description}`)

    let row = `**/${commandName ? `${commandName} ` : ''}${command.name}**`
    if (optionsName.length > 0) {
        row += ` ${optionsName.join(' ')}`
    }

    row += ` - ${command.description}`
    if (optionsDescription.length > 0) {
        row += `\n-# ${optionsDescription.join('\n-# ')}\n`
    }

    return row
}

// Список команд давно не влезает в одно сообщение, поэтому режем его по границам команд
function splitIntoMessages(rows: string[], header: string, footer: string): string[] {
    const messages: string[] = []
    let current: string = header

    for (const row of rows) {
        const block: string = row.length > MESSAGE_LIMIT ? `${row.slice(0, MESSAGE_LIMIT - 1)}…` : row
        const candidate: string = current ? `${current}\n${block}` : block

        if (candidate.length <= MESSAGE_LIMIT) {
            current = candidate
            continue
        }

        messages.push(current)
        current = block
    }

    const withFooter: string = `${current}\n${footer}`
    if (withFooter.length <= MESSAGE_LIMIT) {
        messages.push(withFooter)
    } else {
        messages.push(current, footer)
    }

    return messages
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
    const rows: string[] = commandList
        .map(cmd => commandMap(cmd, command !== null ? command.name : null))

    const messages: string[] = splitIntoMessages(rows, `## ${AVAILABLE_COMMANDS}`, `### ${ADDITIONAL_INFO}`)

    await interaction.editReply({content: messages[0]})

    // Продолжение шлём в канал, а не через followUp — иначе дискорд цепляет ответ на первое сообщение
    const channel = interaction.channel as GuildTextBasedChannel
    for (const message of messages.slice(1)) {
        await channel.send({content: message})
    }
}
