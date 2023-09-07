import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  DateTimeType,
} from '@mikro-orm/core';
import { Post } from '../../posts/entities/post.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Comment {
  @PrimaryKey({ autoincrement: true, columnType: 'int', unsigned: true })
  id: number;

  @Property({ length: 1000 })
  text: string;

  @Property({ type: DateTimeType })
  date: Date = new Date();

  @ManyToOne({
    entity: () => Post,
    fieldName: 'post',
    onUpdateIntegrity: 'cascade',
    onDelete: 'cascade',
    nullable: false,
  })
  post: Post;

  @ManyToOne({
    entity: () => User,
    fieldName: 'user',
    onUpdateIntegrity: 'cascade',
    onDelete: 'cascade',
    nullable: false,
  })
  user: User;
}
