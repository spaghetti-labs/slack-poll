import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { PollEntity } from "./poll";
import { VoteEntity } from "./vote";

@Entity('vote_right')
export class VoteRightEntity extends BaseEntity {
    @PrimaryColumn('uuid')
    id: string

    @Column('varchar', {
        name: 'user_id',
        nullable: false,
    })
    userId: string

    @ManyToOne(() => PollEntity, {
        nullable: false,
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    })
    @JoinColumn({
        name: 'poll_id',
    })
    poll: PollEntity

    @OneToOne(() => VoteEntity, vote => vote.voteRight, {eager: true})
    vote: VoteEntity
}
