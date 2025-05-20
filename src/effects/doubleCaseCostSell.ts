import {AbstractEffect} from './abstractEffect'
import {ChatInputCommandInteraction} from 'discord.js'
import {InventoryItem} from '../entities/psilocybin/InventoryItem'
import {ItemGroup} from '../entities/psilocybin/ItemGroup'
import {MuhomorUser} from '../entities/MuhomorUser'
import MuhomorUserRepository from '../repositories/MuhomorUserRepository'

export class DoubleCaseCostSell extends AbstractEffect {
    removeAfterUse = true

    name = 'Получить двойную стоимость кейса'
    shortName = '💸🪙'
    description = 'Позволяет получить двойную стоимость за кейс, к которому он относится, при использовании'

    async onEffect(interaction: ChatInputCommandInteraction, inventoryItem: InventoryItem, group: ItemGroup|null): Promise<void> {
        if (!group) {
            throw new Error('Предмет не относится ни к одному из кейсов')
        }

        const doubleCost: number = group.cost * 2
        const user: MuhomorUser = await MuhomorUserRepository.getCurrentUser(interaction)
        user.points += doubleCost

        await user.save()

        await interaction.reply(`Вы активировали предмет! Ваш баланс поднялся на ${doubleCost} поинтов и стал ${user.points}!`)
    }
}
