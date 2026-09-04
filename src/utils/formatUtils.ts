export function formatMoney(input: number, trunc: number = 1): number {
    trunc = 10 ** trunc
    return Math.round(input * trunc) / trunc
}

export function formatPoints(points: number): string {
    const value: number = formatMoney(points)
    const [integer, fraction] = Math.abs(value).toString().split('.')
    const sign: string = value < 0 ? '-' : ''
    const grouped: string = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

    return fraction ? `${sign}${grouped}.${fraction}` : `${sign}${grouped}`
}

export function formatTextToKebabCase(text: string): string {
    return text.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}
