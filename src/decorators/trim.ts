export function Trim(target: any, propertyKey: string|symbol, parameterIndex: number) {
	const originalMethod = target[propertyKey]

	target[propertyKey] = function (...args: any[]) {
		if (typeof args[parameterIndex] === 'string') {
			args[parameterIndex] = args[parameterIndex].trim()
		}

		return originalMethod.apply(this, args)
	}
}
