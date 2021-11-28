import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, Unique } from "typeorm";
import { OptionEntity } from "./option";
import { VoteRightEntity } from "./vote-right";

@Entity('vote')
export class VoteEntity extends BaseEntity {
    @ManyToOne(() => OptionEntity, {
        nullable: false,
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    })
    @JoinColumn({
        name: 'option_id',
    })
    option: OptionEntity

    @OneToOne(() => VoteRightEntity, {
        nullable: false,
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
        primary: true,
    })
    @JoinColumn({
        name: 'vote_right_id',
    })
    voteRight: VoteRightEntity
}
