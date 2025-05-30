import 'typeorm'

declare module 'typeorm' {
    interface ColumnOptions {
        description?: string
    }
}
