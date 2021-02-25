import { Entity as TOEntity, Column, Index, BeforeInsert, OneToMany } from "typeorm";
import { IsEmail, Length } from "class-validator";
import bcrypt from "bcrypt";
import { Exclude, Expose } from "class-transformer";
import Entity from "./Entity";

import Chapter from "./Chapter";

@TOEntity("users")
export default class User extends Entity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @Index()
  @IsEmail(undefined, { message: "Must be a valid email adress" })
  @Length(1, 255, { message: "Email is empty" })
  @Column({ unique: true })
  email: string;

  @Index()
  @Length(3, 255, { message: "Must be at least 3 characters long" })
  @Column({ unique: true })
  username: string;

  @Exclude()
  @Column()
  @Length(6, 255, { message: "Must be at least 6 characters long" })
  password: string;

  @Column({ nullable: true })
  imageUrn: string;

  @OneToMany(() => Chapter, (chapter) => chapter.user)
  chapters : Chapter[]

  @Expose()
  get imageUrl(): string {
    return this.imageUrn
      ? `${process.env.APP_URL}/images/${this.imageUrn}`
      : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
  }

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }
}
