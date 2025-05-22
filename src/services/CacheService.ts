import {Snowflake, User} from 'discord.js'
import {ItemGroup} from '../entities/psilocybin/ItemGroup'

export enum PaginationType {
    INVENTORY = 'inventory',
    TRADE_LIST = 'trade-list',
    CASE_ITEM = 'case-item',
}

export interface BasePaginationCache {
    type: PaginationType
    serverId: Snowflake
    createdAt: number
    author: User
}

export interface InventoryCache extends BasePaginationCache {
    type: PaginationType.INVENTORY
    user: User
}

export interface TradeListCache extends BasePaginationCache {
    type: PaginationType.TRADE_LIST
    users: Snowflake[]
}

export interface CaseItemCache extends BasePaginationCache {
    type: PaginationType.CASE_ITEM
    caseEntity: ItemGroup
}

export type PaginationCacheType =
    | InventoryCache
    | TradeListCache
    | CaseItemCache

const PaginationCache = new Map<string, PaginationCacheType>()

setInterval(() => {
    const now = Date.now()
    for (const [key, value] of PaginationCache.entries()) {
        if (now - value.createdAt > 24 * 60 * 60 * 1000) {
            PaginationCache.delete(key)
        }
    }
}, 60 * 1000)

export default PaginationCache
