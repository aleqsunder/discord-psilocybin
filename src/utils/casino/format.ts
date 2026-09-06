import {Snowflake} from 'discord.js'
import {POINTS_EMOJI} from '../../constants'
import {formatMoney, formatPoints} from '../formatUtils'
import {SymbolSet} from './config'
import {Combination, LineDirection, SpinOutcome} from './engine'

// Столько комбинаций перечисляем в сообщении: столько же подсвечивается на картинке
const MAX_LISTED_COMBINATIONS: number = 4

const DIRECTION_NAMES: Record<LineDirection, string> = {
    [LineDirection.HORIZONTAL]: 'горизонталь',
    [LineDirection.VERTICAL]: 'вертикаль',
    [LineDirection.DIAGONAL_DOWN]: 'диагональ ↘',
    [LineDirection.DIAGONAL_UP]: 'диагональ ↗',
    [LineDirection.W]: 'буква W',
    [LineDirection.M]: 'буква M',
    [LineDirection.MINI_W]: 'мини-W',
    [LineDirection.MINI_M]: 'мини-M',
    [LineDirection.V]: 'буква V',
    [LineDirection.LAMBDA]: 'буква Λ',
    [LineDirection.STAIRS_DOWN]: 'лесенка вниз',
    [LineDirection.STAIRS_UP]: 'лесенка вверх',
    [LineDirection.EVERY_COLUMN]: 'в каждом столбце',
    [LineDirection.EVERY_ROW]: 'в каждой строке',
}

function pluralize(count: number, one: string, few: string, many: string): string {
    const tens: number = count % 100
    if (tens >= 11 && tens <= 14) {
        return many
    }

    const units: number = count % 10
    if (units === 1) {
        return one
    }

    return units >= 2 && units <= 4 ? few : many
}

// Ставка стоит рядом с остатком спинов: по ней сразу понятно, откуда берутся суммы выигрышей
function formatStatusLine(bet: number, spinsLeft: number): string {
    const stake: string = `Ставка **${formatPoints(bet)}** ${POINTS_EMOJI}`
    if (spinsLeft <= 0) {
        return `${stake} · спины закончились`
    }

    const verb: string = pluralize(spinsLeft, 'остался', 'осталось', 'осталось')
    const noun: string = pluralize(spinsLeft, 'спин', 'спина', 'спинов')

    return `${stake} · ${verb} **${spinsLeft}** ${noun}`
}

// Общая шапка казино: результат сверху, ниже ставка с остатком спинов и выигрыш за сессию
function formatMessage(
    headline: string,
    details: string[],
    bet: number,
    spinsLeft: number,
    sessionWon: number
): string {
    return [
        headline,
        ...details,
        formatStatusLine(bet, spinsLeft),
        `Общий выигрыш: **${formatPoints(sessionWon)}** ${POINTS_EMOJI}`,
    ].join('\n')
}

function formatCombination(symbols: SymbolSet, combination: Combination): string {
    const name: string = symbols.byId[combination.symbolId]?.name ?? '?'
    const golden: string = combination.goldenCount > 0 ? ` · золото ${combination.goldenCount}` : ''

    return `${name} x${combination.cells.length} `
        + `(${DIRECTION_NAMES[combination.direction]}, x${formatMoney(combination.multiplier, 2)})${golden}`
}

// Каждая покупка — своя игра в своём сообщении, поэтому общий выигрыш начинается с нуля
export function formatPurchase(userId: Snowflake, bet: number, spinsLeft: number): string {
    return formatMessage(`🎰 <@${userId}> заряжает казино`, [], bet, spinsLeft, 0)
}

export function formatTopUp(
    userId: Snowflake,
    count: number,
    bet: number,
    spinsLeft: number,
    sessionWon: number
): string {
    const noun: string = pluralize(count, 'спин', 'спина', 'спинов')
    return formatMessage(`🎰 <@${userId}> докупил ${count} ${noun}`, [], bet, spinsLeft, sessionWon)
}

// Во время прокрутки меняется только остаток спинов: результат и выигрыш ещё не раскрыты
export function formatSpinning(userId: Snowflake, bet: number, spinsLeft: number, sessionWon: number): string {
    return formatMessage(`🎰 <@${userId}>`, [], bet, spinsLeft, sessionWon)
}

export function formatSpinResult(
    symbols: SymbolSet,
    userId: Snowflake,
    outcome: SpinOutcome,
    bet: number,
    spinsLeft: number,
    sessionWon: number
): string {
    let headline: string = `🎰 <@${userId}> — **мимо**`
    if (outcome.isSuperWin) {
        headline = `🎰 <@${userId}> — 💥 **СУПЕРВЫИГРЫШ +${formatPoints(outcome.total)}** ${POINTS_EMOJI}`
    } else if (outcome.total > 0) {
        headline = `🎰 <@${userId}> — **+${formatPoints(outcome.total)}** ${POINTS_EMOJI}`
    }

    const details: string[] = []
    if (outcome.combinations.length > 0) {
        const sorted: Combination[] = [...outcome.combinations].sort((a, b) => b.payout - a.payout)
        const shown: string[] = sorted.slice(0, MAX_LISTED_COMBINATIONS).map(c => formatCombination(symbols, c))
        const hidden: number = sorted.length - shown.length
        if (hidden > 0) {
            shown.push(`и ещё ${hidden}`)
        }

        details.push(`-# ${shown.join(' · ')}`)
    }

    const bonuses: string[] = []
    // Множитель без выигрыша умножать нечего — не показываем, чтобы не путать
    if (outcome.multiplier > 1 && outcome.total > 0) {
        bonuses.push(`Множитель x${outcome.multiplier}`)
    }

    if (outcome.freeSpins > 0) {
        bonuses.push(`Фриспины +${outcome.freeSpins} 🎟️`)
    }

    if (bonuses.length > 0) {
        details.push(`-# ${bonuses.join(' · ')}`)
    }

    return formatMessage(headline, details, bet, spinsLeft, sessionWon)
}
