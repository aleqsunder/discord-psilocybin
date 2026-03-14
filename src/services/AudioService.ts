import path from 'path'

export async function toAudioInput(audioUrl: string): Promise<{data: string; format: 'wav' | 'm4a' | 'mp3'}> {
    if (audioUrl.startsWith('data:')) {
        const match = audioUrl.match(/^data:([^;]+);base64,(.+)$/)
        if (!match) {
            throw new Error('AUDIO_DATA_URL_INVALID')
        }

        const mimeType = match[1]
        const data = match[2]
        return {data, format: audioFormatFromMime(mimeType)}
    }

    const response = await fetch(audioUrl)
    if (!response.ok) {
        throw new Error(`AUDIO_FETCH_FAILED_${response.status}`)
    }

    const contentTypeHeader = response.headers.get('content-type') ?? ''
    const contentType = contentTypeHeader.split(';')[0].trim()
    const format = contentType ? audioFormatFromMime(contentType) : audioFormatFromUrl(audioUrl)
    const buffer = Buffer.from(await response.arrayBuffer())
    const data = buffer.toString('base64')
    return {data, format}
}

function audioFormatFromMime(mimeType: string): 'wav' | 'm4a' | 'mp3' {
    const mime = mimeType.toLowerCase()
    if (mime.includes('wav')) return 'wav'
    if (mime.includes('m4a') || mime.includes('mp4')) return 'm4a'
    return 'mp3'
}

function audioFormatFromUrl(audioUrl: string): 'wav' | 'm4a' | 'mp3' {
    try {
        const url = new URL(audioUrl)
        const ext = path.extname(url.pathname).toLowerCase()
        if (ext === '.wav') return 'wav'
        if (ext === '.m4a') return 'm4a'
    } catch {
        return 'mp3'
    }

    return 'mp3'
}
