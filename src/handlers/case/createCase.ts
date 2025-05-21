import {Attachment, AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder} from 'discord.js'
import {ItemGroup} from '../../entities/psilocybin/ItemGroup'
import {DEFAULT_GROUP_IMAGE_PATH, DEFAULT_GROUPS_CATALOG} from '../../constants'
import {saveImageToStorage} from '../../utils/imageUtils'
import path from 'path'
import {isAdmin} from '../../utils/permissionUtils'

export async function createCaseHandler(interaction: ChatInputCommandInteraction): Promise<void> {
	if (!isAdmin(interaction)) {
		await interaction.editReply(`У вас недостаточно прав для выполнения данной команды`)
		return
	}

	const name: string = interaction.options.getString('name', true)
	const description: string = interaction.options.getString('description', true)
	const image: Attachment|null = interaction.options.getAttachment('image')
	const cost: number|null = interaction.options.getNumber('cost')

	const group = new ItemGroup()
	group.serverId = interaction.guildId!
	group.name = name
	group.description = description

	if (cost) {
		group.cost = cost
	}

	await group.save()

	let imagePath: string = DEFAULT_GROUP_IMAGE_PATH
	if (image) {
		imagePath = await saveImageToStorage(group.id, image, DEFAULT_GROUPS_CATALOG)
	}

	group.imagePath = imagePath
	await group.save()

	const attachment = new AttachmentBuilder(imagePath, {name: path.basename(imagePath)})
	const embed = new EmbedBuilder()
		.setTitle(`Группа "${group.name}" (id: ${group.id}) создана!`)
		.setDescription(group.description)
		.setImage(`attachment://${path.basename(imagePath)}`)
		.setColor(0x123456)

	await interaction.editReply({embeds: [embed], files: [attachment]})
}
