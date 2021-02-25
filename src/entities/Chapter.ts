import {
  Entity as TOEntity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
  BeforeInsert,
} from "typeorm";

import Entity from "./Entity";
import User from "./User";
import Story from "./Story";
import { makeId, slugify } from "../utils/helpers";

@TOEntity("chapters")
export default class Chapter extends Entity {
  constructor(chapter: Partial<Chapter>) {
    super();
    Object.assign(this, chapter);
  }

  @Index()
  @Column()
  identifier: string;

  @Index()
  @Column()
  title: string;

  @Index()
  @Column()
  slug: string;

  @Column({ nullable: true, type: "text" })
  body: string;

  @Column()
  username: string;

  @Column()
  storyName: string;

  @ManyToOne(() => User, (user) => user.chapters)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  @ManyToOne(() => Story, (sub) => sub.chapters)
  @JoinColumn({ name: "storyName", referencedColumnName: "name" })
  story: Story;

  @BeforeInsert()
  makeIdAndSlug() {
    this.identifier = makeId(7);
    this.slug = slugify(this.title);
  }
}
