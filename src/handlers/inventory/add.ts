import {AttachmentBuilder, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, User} from 'discord.js'
import {Item} from '../../entities/psilocybin/Item'
import ItemRepository from '../../repositories/ItemRepository'
import InventoryRepository from '../../repositories/InventoryRepository'
import {Inventory} from '../../entities/psilocybin/Inventory'
import {InventoryItem} from '../../entities/psilocybin/InventoryItem'
import path from 'path'
import {isAdmin} from '../../utils/permissionUtils'

export async function addItemInInventoryHandler(interaction: ChatInputCommandInteraction): Promise<void> {
    const user: User = interaction.options.getUser('user', true)
    const itemId: number = interaction.options.getNumber('item', true)
    const item: Item|null = await ItemRepository.findOne({
        where: {
            id: itemId,
            serverId: interaction.guildId!,
        },
        relations: ['quality']
    })

    if (!item) {
        await interaction.editReply(`Предмета не существует`)
        return
    }

    try {
        let inventory: Inventory|null = await InventoryRepository.findOneBy({
            serverId: interaction.guildId!,
            userId: user.id
        })
        if (!inventory) {
            inventory = new Inventory()
            inventory.serverId = interaction.guildId!
            inventory.userId = user.id

            await inventory.save()
        }

        const inventoryItem: InventoryItem = new InventoryItem()
        inventoryItem.inventory = inventory
        inventoryItem.item = item

        await inventoryItem.save()
    } catch (error) {
        console.error(error)
        await interaction.editReply(`Не удалось добавить предмет, внутренняя ошибка`)
        return
    }

    const attachment = new AttachmentBuilder(item.imagePath, {name: path.basename(item.imagePath)})
    const embed = new EmbedBuilder()
        .setTitle(`Предмет "${item.name}" (id: ${item.id})`)
        .setDescription(item.description)
        .addFields(
            {name: 'Качество', value: item.quality?.name ?? ''},
        )
        .setImage(`attachment://${path.basename(item.imagePath)}`)
        .setColor((item.quality?.colorHex ?? '#808080') as ColorResolvable)

    await interaction.editReply({
        embeds: [embed],
        files: [attachment],
        content: `Предмет добавлен в инвентарь пользователю <@${user.id}>`
    })
}
