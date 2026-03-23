import {Message} from 'discord.js'
import {analyzeMedia, analyzeTextChain} from '../services/OpenAIService'

function isImageAttachment(message: Message): string | null {
    const attachment = message.attachments.find(item => {
        if (item.contentType?.startsWith('image/')) {
            return true
        }

        const url = item.url.toLowerCase()
        return url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.gif') || url.endsWith('.webp')
    })

    return attachment?.url ?? null
}

function stripBotMention(content: string, botId: string): string {
    return content
        .replace(new RegExp(`<@!?${botId}>`, 'g'), '')
        .trim()
}

function isAudioAttachment(message: Message): string | null {
    const attachment = message.attachments.find(item => {
        if (item.contentType?.startsWith('audio/')) {
            return true
        }

        const url = item.url.toLowerCase()
        return url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.m4a')
    })

    return attachment?.url ?? null
}

function isVideoAttachment(message: Message): string | null {
    const attachment = message.attachments.find(item => {
        if (item.contentType?.startsWith('video/')) {
            return true
        }

        const url = item.url.toLowerCase()
        return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov')
    })

    return attachment?.url ?? null
}

async function buildMessageChain(start: Message, limit: number): Promise<Message[]> {
    const chain: Message[] = []
    let current: Message | null = start

    while (current && chain.length < limit) {
        chain.push(current)
        if (!current.reference?.messageId) {
            break
        }

        try {
            current = await current.fetchReference()
        } catch {
            break
        }
    }

    return chain.reverse()
}

function formatMessageChain(messages: Message[]): string {
    return messages.map(message => {
        const author = message.member?.displayName ?? message.author.username
        const content = message.cleanContent.trim()
        const text = content.length > 0 ? content : '[без текста]'
        return `${author}: ${text}`
    }).join('\n')
}

function splitIntoChunks(text: string, maxLength: number): string[] {
    let remaining = text.trim()
    const parts: string[] = []

    while (remaining.length > maxLength) {
        const spaceIndex = remaining.lastIndexOf(' ', maxLength)
        const dotIndex = remaining.lastIndexOf('.', maxLength)
        let splitIndex = Math.max(spaceIndex, dotIndex)
        if (splitIndex < 1) {
            splitIndex = maxLength
        } else if (remaining[splitIndex] === '.') {
            splitIndex += 1
        }

        const chunk = remaining.slice(0, splitIndex).trimEnd()
        parts.push(chunk)
        remaining = remaining.slice(splitIndex).trimStart()
    }

    if (remaining.length > 0) {
        parts.push(remaining)
    }

    return parts
}

export async function messageCreateHandler(message: Message): Promise<void> {
    const botId = message.client.user?.id
    if (message.author.bot || !message.inGuild() || !botId || !message.mentions.users.has(botId) || !message.reference?.messageId) {
        return
    }

    let referenced: Message
    try {
        referenced = await message.fetchReference()
    } catch (error) {
        console.error(error)
        return
    }

    const requestText = stripBotMention(message.content, botId)
    const basePrompt = requestText.length > 0 ? requestText : ''
    const prompt = (message.member?.displayName ?? message.author.username) + `: ${basePrompt}`

    const media = [
        {kind: 'video', url: isVideoAttachment(referenced), fallback: 'Опиши, что происходит в видео'},
        {kind: 'audio', url: isAudioAttachment(referenced), fallback: 'Опиши, что на аудио'},
        {kind: 'image', url: isImageAttachment(referenced), fallback: 'Опиши, что на изображении'}
    ].find(item => item.url)
    const hasMedia = Boolean(media?.url)

    let replyMessage: Message | null = null
    try {
        replyMessage = await message.reply({content: 'Думаю...', allowedMentions: {repliedUser: false}})
        let content = ''
        if (hasMedia && media) {
            const finalPrompt = prompt.length > 0 ? prompt : media.fallback
            content = await analyzeMedia({
                prompt: finalPrompt,
                imageUrl: media.kind === 'image' ? media.url : null,
                audioUrl: media.kind === 'audio' ? media.url : null,
                videoUrl: media.kind === 'video' ? media.url : null
            })
        } else {
            const finalPrompt = prompt.length > 0 ? prompt : 'Ответь на цепочку сообщений'
            const chain = await buildMessageChain(referenced, 5)
            const chainText = formatMessageChain(chain)
            content = await analyzeTextChain({prompt: finalPrompt, chain: chainText})
        }

        if (!content) {
            await replyMessage.edit('Не удалось получить ответ')
            return
        }

        const parts = splitIntoChunks(content, 2000)
        await replyMessage.edit(parts[0])
        for (const part of parts.slice(1)) {
            await message.channel.send({content: part})
        }
    } catch (error) {
        console.error(error)
        if (replyMessage) {
            await replyMessage.edit('Ошибка при обработке запроса, подробности в консоли')
        } else {
            await message.reply({content: 'Ошибка при обработке запроса, подробности в консоли', allowedMentions: {repliedUser: false}})
        }
    }
}
