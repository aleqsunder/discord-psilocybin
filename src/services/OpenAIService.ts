import OpenAI from 'openai'
import process from 'process'
import path from 'path'

const DEFAULT_BASE_URL = 'https://bothub.chat/api/v2/openai/v1'

export function createOpenAIClient(apiKey?: string): OpenAI {
    const key = apiKey ?? process.env.OPENAI_API_KEY
    if (!key) {
        throw new Error('OPENAI_API_KEY is empty')
    }

    const baseURL = process.env.OPENAI_BASE_URL ?? DEFAULT_BASE_URL
    return new OpenAI({apiKey: key, baseURL})
}

export async function analyzeImage({
    prompt,
    imageUrl
}: {
    prompt: string
    imageUrl: string
}): Promise<string> {
    const client = createOpenAIClient()
    const model = process.env.SUMMARY_MODEL ?? ''
    if (model.trim().length <= 1) {
        throw new Error('SUMMARY_MODEL is empty')
    }

    const dataUrl = await toDataUrl(imageUrl)
    const response = await client.chat.completions.create({
        model,
        messages: [
            {
                role: 'user',
                content: [
                    {type: 'text', text: prompt},
                    {type: 'image_url', image_url: {url: dataUrl}}
                ]
            }
        ]
    })

    return response.choices?.[0]?.message?.content?.trim() ?? ''
}

async function toDataUrl(imageUrl: string): Promise<string> {
    if (imageUrl.startsWith('data:')) {
        return imageUrl
    }

    const response = await fetch(imageUrl)
    if (!response.ok) {
        throw new Error(`IMAGE_FETCH_FAILED_${response.status}`)
    }

    const contentTypeHeader = response.headers.get('content-type') ?? ''
    const contentType = contentTypeHeader.split(';')[0].trim()
    const mimeType = contentType || mimeTypeFromUrl(imageUrl)
    const buffer = Buffer.from(await response.arrayBuffer())
    const base64 = buffer.toString('base64')
    return `data:${mimeType};base64,${base64}`
}

function mimeTypeFromUrl(imageUrl: string): string {
    try {
        const url = new URL(imageUrl)
        const ext = path.extname(url.pathname).toLowerCase()
        if (ext === '.png') return 'image/png'
        if (ext === '.webp') return 'image/webp'
        if (ext === '.gif') return 'image/gif'
        if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
    } catch {
        return 'image/jpeg'
    }

    return 'image/jpeg'
}

export async function summarizeChat({
    instruction,
    transcript
}: {
    instruction: string
    transcript: string
}): Promise<string> {
    const client = createOpenAIClient()
    const model = process.env.SUMMARY_MODEL ?? ''
    if (model.trim().length <= 1) {
        throw new Error('SUMMARY_MODEL is empty')
    }

    const response = await client.chat.completions.create({
        model,
        messages: [
            {
                role: 'user',
                content: `Инструкция: ${instruction}\n\nСообщения за последнее время:\n${transcript}`
            }
        ]
    })

    return response.choices?.[0]?.message?.content?.trim() ?? ''
}
