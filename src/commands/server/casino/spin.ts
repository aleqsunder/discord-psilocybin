import {SlashCommandSubcommandBuilder} from 'discord.js'
import {MAX_BET, MAX_SPINS_PER_PURCHASE, MIN_BET} from '../../../utils/casino/config'

export const spin: SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder()
    .setName('spin')
    .setDescription('Купить спины и сыграть в казино')
    .addNumberOption(option =>
        option
            .setName('count')
            .setDescription(`Количество спинов (до ${MAX_SPINS_PER_PURCHASE}, полный пакет со скидкой)`)
            .setMinValue(1)
            .setMaxValue(MAX_SPINS_PER_PURCHASE)
    )
    .addNumberOption(option =>
        option
            .setName('bet')
            .setDescription(`Ставка за спин от ${MIN_BET} до ${MAX_BET}: чем выше, тем крупнее выигрыши`)
            .setMinValue(MIN_BET)
            .setMaxValue(MAX_BET)
    )
