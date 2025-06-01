import {AutocompleteFocusedOption, AutocompleteInteraction} from 'discord.js'
import {jsonServerCommands} from '../../commands'

export async function commandList(interaction: AutocompleteInteraction): Promise<void> {
    const commandTemp: AutocompleteFocusedOption = interaction.options.getFocused(true)
    const commands: PsilocybinCommand[] = jsonServerCommands.filter(command => command.name.includes(commandTemp.value))
    const commandsResponse: StringResponseBody[] = commands.map(command => ({
        name: command.name,
        value: command.name,
    }))

    await interaction.respond(commandsResponse)
}
