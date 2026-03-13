import {ChatInputCommandInteraction, GuildTextBasedChannel, Message} from 'discord.js'
import process from 'process'
import {summarizeChat} from '../services/OpenAIService'

const MAX_MESSAGES = 50
const MAX_MESSAGE_LENGTH = 500

function formatMessage(message: Message): string {
    const author = message.member?.displayName ?? message.author.username
    const content = message.cleanContent.trim()
    const trimmedContent = content.length > MAX_MESSAGE_LENGTH
        ? `${content.slice(0, MAX_MESSAGE_LENGTH)}…`
        : content

    const attachments = [...message.attachments.values()]
        .map(attachment => attachment.name ?? attachment.url)
    const attachmentsText = attachments.length > 0
        ? ` [вложения: ${attachments.join(', ')}]`
        : ''

    const text = trimmedContent.length > 0 ? trimmedContent : '[без текста]'
    return `${author}: ${text}${attachmentsText}`
}

export async function summaryHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()

    const channel = interaction.channel
    if (!channel || !channel.isTextBased()) {
        await interaction.editReply('Команда доступна только в текстовых каналах')
        return
    }

    let messages: Message[]
    try {
        const fetched = await (channel as GuildTextBasedChannel).messages.fetch({limit: MAX_MESSAGES})
        messages = [...fetched.values()]
    } catch (error) {
        console.error(error)
        await interaction.editReply('Не удалось получить историю сообщений')
        return
    }

    if (messages.length === 0) {
        await interaction.editReply('В канале нет сообщений для анализа')
        return
    }

    messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp)

    const transcript = messages.map(formatMessage).join('\n')
    const style = interaction.options.getString('style') ?? 'frivolous'
    const instruction = style === 'serious'
        ? (process.env.SUMMARY_SERIOUS_PROMPT ?? '')
        : (process.env.SUMMARY_FRIVOLOUS_PROMPT ?? '')

    if (instruction.trim().length <= 1) {
        await interaction.editReply('Не задан промпт для выбранного стиля')
        return
    }

    try {
        const summary = await summarizeChat({instruction, transcript})
        if (!summary) {
            await interaction.editReply('Не удалось получить сводку')
            return
        }

        await interaction.editReply(summary)
    } catch (error) {
        console.error(error)
        await interaction.editReply('Ошибка при генерации сводки, подробности в консоли')
    }
}
