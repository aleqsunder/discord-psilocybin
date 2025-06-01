declare type ListImageConfig = {
	rows?: number
	itemsInRow?: number
	padding?: number
	radius?: number
	imageSize?: number
}

declare type RequiredListImageConfig = Required<ListImageConfig>

declare type PaginationItem = number | '...'

declare type PsilocybinCommand = {
	name: string
	description: string
	options?: PsilocybinCommand[]
}

declare type SnowflakeOrNull = string|null

declare interface StringResponseBody {
	name: string
	value: string
}

declare interface NumberResponseBody extends StringResponseBody {
	value: number
}
