import {soundcloudInstance} from '../../../services/DistubeService'
import {Song} from 'distube'
import {SearchType} from '@distube/soundcloud'

export async function searchSoundcloud(input: string): Promise<StringResponseBody[]> {
    if (!soundcloudInstance) {
        return []
    }

    const results: Song[] = await soundcloudInstance.search(input, SearchType.Track, 10)
    return results.map(song => ({
        name: song.name!,
        value: song.url!,
    }))
}
