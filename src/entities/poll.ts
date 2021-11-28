import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { OptionEntity } from "./option";
import { VoteRightEntity } from "./vote-right";

@Entity('poll')
export class PollEntity extends BaseEntity {
    @PrimaryColumn('uuid')
    id: string

    @Column('varchar', {
        name: 'user_id',
        nullable: false,
    })
    userId: string

    @OneToMany(() => OptionEntity, option => option.poll, { cascade: true })
    options: OptionEntity[]

    @OneToMany(() => VoteRightEntity, option => option.poll, { cascade: true })
    voteRights: VoteRightEntity[]
}
