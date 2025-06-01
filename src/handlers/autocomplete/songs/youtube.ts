import {YouTubeSearchResultSong} from '@distube/youtube'
import {youtubeInstance} from '../../../services/DistubeService'

export async function searchYoutube(input: string): Promise<StringResponseBody[]> {
    if (!youtubeInstance) {
        return []
    }

    const results: YouTubeSearchResultSong[] = await youtubeInstance.search(input, {limit: 10})
    return results.map(song => ({
        name: song.name!,
        value: song.url!,
    }))
}
