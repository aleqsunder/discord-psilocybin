import {Attachment, AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder} from 'discord.js'
import {ItemGroup} from '../../entities/psilocybin/ItemGroup'
import {DEFAULT_GROUPS_CATALOG} from '../../constants'
import {saveImageToStorage} from '../../utils/imageUtils'
import path from 'path'
import ItemGroupRepository from '../../repositories/ItemGroupRepository'
import {isAdmin} from '../../utils/permissionUtils'

export async function editCaseHandler(interaction: ChatInputCommandInteraction): Promise<void> {
	if (!isAdmin(interaction)) {
		await interaction.editReply(`У вас недостаточно прав для выполнения данной команды`)
		return
	}

	const groupId: string = interaction.options.getString('case', true)
	const name: string|null = interaction.options.getString('name')
	const description: string|null = interaction.options.getString('description')
	const image: Attachment|null = interaction.options.getAttachment('image')
	const cost: number|null = interaction.options.getNumber('cost')

	const group: ItemGroup|null = await ItemGroupRepository.findOneBy({id: Number(groupId)})
	if (!group) {
		await interaction.editReply(`Группа не существует`)
		return
	}

	if (name) {
		group.name = name
	}

	if (description) {
		group.description = description
	}

	if (image) {
		group.imagePath = await saveImageToStorage(group.id, image, DEFAULT_GROUPS_CATALOG)
	}

	if (cost) {
		group.cost = cost
	}

	await group.save()

	const attachment = new AttachmentBuilder(group.imagePath, {name: path.basename(group.imagePath)})
	const embed = new EmbedBuilder()
		.setTitle(`Группа "${group.name}" (id: ${group.id}) создана!`)
		.setDescription(group.description)
		.setImage(`attachment://${path.basename(group.imagePath)}`)
		.setColor(0x123456)

	await interaction.editReply({embeds: [embed], files: [attachment]})
}
