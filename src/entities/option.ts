import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { PollEntity } from "./poll";
import { VoteEntity } from "./vote";

@Entity('option')
export class OptionEntity extends BaseEntity {
    @PrimaryColumn('uuid')
    id: string

    @Column('text', {
        nullable: false,
    })
    text: string

    @ManyToOne(() => PollEntity, {
        nullable: false,
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    })
    @JoinColumn({
        name: 'poll_id',
    })
    poll: PollEntity

    @OneToMany(() => VoteEntity, vote => vote.option)
    votes: VoteEntity[]
}
