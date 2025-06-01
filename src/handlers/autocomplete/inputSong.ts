import {AutocompleteFocusedOption, AutocompleteInteraction} from 'discord.js'
import {searchYoutube} from './songs/youtube'
import {searchSoundcloud} from './songs/soundcloud'

export async function inputSongHandler(interaction: AutocompleteInteraction): Promise<void> {
    const song: AutocompleteFocusedOption = interaction.options.getFocused(true)
    if (song.value.trim().length === 0) {
        return await interaction.respond([])
    }

    const platform: string = interaction.options.getString('platform') ?? 'youtube'
    switch (platform) {
        case 'youtube': return await interaction.respond(await searchYoutube(song.value))
        case 'soundcloud': return await interaction.respond(await searchSoundcloud(song.value))
    }
}
