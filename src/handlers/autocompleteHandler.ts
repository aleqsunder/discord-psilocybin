import {AutocompleteFocusedOption, AutocompleteInteraction} from 'discord.js'
import {effectItemAutocompleteHandler} from './autocomplete/effectItem'
import {userItemAutocompleteHandler} from './autocomplete/userItem'
import {inputSongHandler} from './autocomplete/inputSong'
import {caseAutocompleteHandler} from './autocomplete/case'
import {commandList} from './autocomplete/command'
import {itemQualityAutocompleteHandler} from './autocomplete/itemQuality'
import {itemAutocompleteHandler} from './autocomplete/item'

export async function autocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
	const focused: AutocompleteFocusedOption = interaction.options.getFocused(true)
	switch (focused.name) {
		case 'item': return await itemAutocompleteHandler(interaction)
		case 'quality': return await itemQualityAutocompleteHandler(interaction)
		case 'case': return await caseAutocompleteHandler(interaction)
		case 'command': return await commandList(interaction)
		case 'user-item': return await userItemAutocompleteHandler(interaction)
		case 'effect-item': return await effectItemAutocompleteHandler(interaction)
		case 'song': return await inputSongHandler(interaction)

		default: throw new Error(`Несуществующий автокомплит ${focused.name}`)
	}
}
