import {Message} from 'discord.js'
import {analyzeImage} from '../services/OpenAIService'

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
    if (!imageUrl) {
        await message.reply({content: 'В цитируемом сообщении нет изображения', allowedMentions: {repliedUser: false}})
        return
    }

    const requestText = stripBotMention(message.content, botId)
    const prompt = requestText.length > 0 ? requestText : 'Опиши, что на изображении'

    let replyMessage: Message | null = null
    try {
        replyMessage = await message.reply({content: 'Думаю...', allowedMentions: {repliedUser: false}})
        const content = await analyzeImage({prompt, imageUrl})
        if (!content) {
            await replyMessage.edit('Не удалось получить ответ по изображению')
            return
        }

        await replyMessage.edit(content)
    } catch (error) {
        console.error(error)
        if (replyMessage) {
            await replyMessage.edit('Ошибка при обработке изображения, подробности в консоли')
        } else {
            await message.reply({content: 'Ошибка при обработке изображения, подробности в консоли', allowedMentions: {repliedUser: false}})
        }
    }
}
