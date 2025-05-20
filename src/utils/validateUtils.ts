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
