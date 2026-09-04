export function validateName(name: string): boolean {
    if (!name) {
        throw new Error('Название роли не может быть пустым')
    }
    if (name.length > 100) {
        throw new Error('Название роли не должно превышать 100 символов')
    }

    return true
}

export function validateColor(color: string): boolean {
    const hexColorRegex = /^#?([A-Fa-f0-9]{6})$/
    if (!hexColorRegex.test(color)) {
        throw new Error('Цвет должен быть в формате HEX (например, #FF5733)')
    }

    return true
}

export function validatePromocodeName(name: string): boolean {
    if (!name) {
        throw new Error('Название промокода не может быть пустым')
    }
    if (name.length > 100) {
        throw new Error('Название промокода не должно превышать 100 символов')
    }

    return true
}

export function validatePromocodeMoney(money: number): boolean {
    if (!Number.isFinite(money)) {
        throw new Error('Сумма должна быть числом')
    }
    if (!Number.isInteger(money)) {
        throw new Error('Сумма должна быть целым числом')
    }
    if (money <= 0) {
        throw new Error('Сумма должна быть больше нуля')
    }

    return true
}
