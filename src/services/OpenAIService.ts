import OpenAI from 'openai'
import process from 'process'
import path from 'path'
import sharp from 'sharp'

const DEFAULT_BASE_URL = 'https://bothub.chat/api/v2/openai/v1'
const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const DEFAULT_PROMPT = process.env.DEFAULT_PROMPT ?? ''

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
                    {type: 'text', text: DEFAULT_PROMPT + prompt},
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
    let mimeType = contentType || mimeTypeFromUrl(imageUrl)
    let buffer = Buffer.from(await response.arrayBuffer())

    if (buffer.length > MAX_IMAGE_BYTES) {
        const compressed = await compressImageBuffer(buffer)
        buffer = Buffer.from(compressed.buffer)
        mimeType = compressed.mimeType
    }

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

async function compressImageBuffer(input: Buffer): Promise<{buffer: Buffer<ArrayBufferLike>; mimeType: string}> {
    let buffer = input
    let quality = 80
    const metadata = await sharp(input).metadata()
    let width = metadata.width ?? null

    while (buffer.length > MAX_IMAGE_BYTES) {
        if (width && width > 200) {
            width = Math.max(200, Math.floor(width * 0.8))
            buffer = await sharp(buffer).resize({width}).jpeg({quality}).toBuffer()
        } else if (quality > 40) {
            quality -= 10
            buffer = await sharp(buffer).jpeg({quality}).toBuffer()
        } else {
            buffer = await sharp(buffer).jpeg({quality: 40}).toBuffer()
            break
        }
    }

    return {buffer, mimeType: 'image/jpeg'}
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
                content: `${DEFAULT_PROMPT} Инструкция: ${instruction}\n\nСообщения за последнее время:\n${transcript}`
            }
        ]
    })

    return response.choices?.[0]?.message?.content?.trim() ?? ''
}
