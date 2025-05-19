import "reflect-metadata"
import {BaseEntity, Column, Entity, PrimaryColumn} from "typeorm"
import {Snowflake} from "discord.js"

// Third-party db from the "Muhomor" bot
// Tried to convey it in its original form
@Entity('db_user_info')
export class MuhomorUser extends BaseEntity {
	@PrimaryColumn('text')
	userid!: Snowflake

	@PrimaryColumn('text')
	guildid!: Snowflake

	@Column('integer', {default: 0})
	points!: number

	@Column('integer', {default: 0})
	allpoints!: number

	@Column('integer', {default: 0})
	afkpoints!: number

	@Column('integer', {default: 0})
	afkchatpoints!: number
}
