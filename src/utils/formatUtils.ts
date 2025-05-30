export function formatMoney(input: number, trunc: number = 1): number {
    trunc = 10 ** trunc
    return Math.round(input * trunc) / trunc
}

export function formatTextToKebabCase(text: string): string {
    return text.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}
