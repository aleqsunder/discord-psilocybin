import OpenAI from 'openai'
import process from 'process'
import {toAudioInput} from './AudioService'
import {toVideoDataUrl} from './VideoService'
import {toImageDataUrl} from './ImageService'

const DEFAULT_BASE_URL = 'https://bothub.chat/api/v2/openai/v1'
const DEFAULT_PROMPT = process.env.DEFAULT_PROMPT ?? ''

export function createOpenAIClient(apiKey?: string): OpenAI {
    const key = apiKey ?? process.env.OPENAI_API_KEY
    if (!key) {
        throw new Error('OPENAI_API_KEY is empty')
    }

    const baseURL = process.env.OPENAI_BASE_URL ?? DEFAULT_BASE_URL
    return new OpenAI({apiKey: key, baseURL})
}

export interface AnalyzeMediaParams {
    prompt: string
    imageUrl: string | null
    audioUrl: string | null
    videoUrl: string | null
}

export async function analyzeMedia({prompt, imageUrl, audioUrl, videoUrl}: AnalyzeMediaParams): Promise<string> {
    const client = createOpenAIClient()
    const model = process.env.SUMMARY_MODEL ?? ''
    if (model.trim().length <= 1) {
        throw new Error('SUMMARY_MODEL is empty')
    }

    const content: any[] = [{type: 'text', text: DEFAULT_PROMPT + prompt}]
    if (imageUrl) {
        const dataUrl = await toImageDataUrl(imageUrl)
        content.push({type: 'image_url', image_url: {url: dataUrl}})
    }
    if (audioUrl) {
        const input = await toAudioInput(audioUrl)
        content.push({type: 'input_audio', input_audio: input})
    }
    if (videoUrl) {
        const dataUrl = await toVideoDataUrl(videoUrl)
        content.push({type: 'video_url', video_url: {url: dataUrl}})
    }

    const response = await client.chat.completions.create({
        model,
        messages: [
            {
                role: 'user',
                content
            }
        ]
    })

    return response.choices?.[0]?.message?.content?.trim() ?? ''
}

export async function analyzeTextChain({
    prompt,
    chain
}: {
    prompt: string
    chain: string
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
                content: `${DEFAULT_PROMPT}\n\nЦепочка сообщений:\n${chain}\n\n${prompt}`
            }
        ]
    })

    return response.choices?.[0]?.message?.content?.trim() ?? ''
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
