import {AutocompleteFocusedOption, AutocompleteInteraction} from 'discord.js'
import {ItemQuality} from '../../entities/psilocybin/ItemQuality'
import ItemQualityRepository from '../../repositories/ItemQualityRepository'
import {Like} from 'typeorm'

export async function itemQualityAutocompleteHandler(interaction: AutocompleteInteraction): Promise<void> {
    const qualityTemp: AutocompleteFocusedOption = interaction.options.getFocused(true)
    const qualities: ItemQuality[] = await ItemQualityRepository.find({
        where: {
            name: Like(`%${qualityTemp.value}%`),
            serverId: interaction.guildId!,
        },
        take: 10,
    })

    const qualitiesResponse: NumberResponseBody[] = qualities.map(quality => ({
        name: quality.name,
        value: quality.id,
    }))

    await interaction.respond(qualitiesResponse)
}
