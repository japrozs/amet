import {
  Entity as TOEntity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";

import User from "./User";
import Entity from "./Entity";
import Chapter from "./Chapter";

@TOEntity("stories")
export default class Story extends Entity {
    constructor(story: Partial<Story>) {
        super();
        Object.assign(this, story);
    }

    @Index()
    @Column({ unique : true})
    name : string

    @Column({ type : 'text', nullable : true})
    description : string

    @Column()
    username : string

    @ManyToOne(() => User)
    @JoinColumn({ name : "username", referencedColumnName : "username"})
    user : User;

    @OneToMany(() => Chapter, (chapter) => chapter.story)
    chapters : Chapter[]
}   