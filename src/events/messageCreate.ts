import {Message} from 'discord.js'
import {analyzeAudio, analyzeImage, analyzeTextChain} from '../services/OpenAIService'

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

    const imageUrl = isImageAttachment(referenced)
    const audioUrl = !imageUrl ? isAudioAttachment(referenced) : null

    const requestText = stripBotMention(message.content, botId)
    let prompt = requestText.length > 0 ? requestText : ''

    let replyMessage: Message | null = null
    try {
        replyMessage = await message.reply({content: 'Думаю...', allowedMentions: {repliedUser: false}})
        let content = ''
        if (imageUrl) {
            if (!prompt) {
                prompt = 'Опиши, что на изображении'
            }
            content = await analyzeImage({prompt, imageUrl})
        } else if (audioUrl) {
            if (!prompt) {
                prompt = 'Опиши, что на аудио'
            }
            content = await analyzeAudio({prompt, audioUrl})
        } else {
            if (!prompt) {
                prompt = 'Ответь на цепочку сообщений'
            }
            const chain = await buildMessageChain(referenced, 6)
            const chainText = formatMessageChain(chain)
            content = await analyzeTextChain({prompt, chain: chainText})
        }

        if (!content) {
            await replyMessage.edit('Не удалось получить ответ по изображению')
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
