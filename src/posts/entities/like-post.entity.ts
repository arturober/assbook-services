import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { User } from '../../users/entities/user.entity';
import { Post } from './post.entity';

@Entity({ tableName: 'user_like_post' })
export class LikePost {
  @ManyToOne({
    entity: () => User,
    fieldName: 'user',
    onUpdateIntegrity: 'cascade',
    onDelete: 'cascade',
    nullable: false,
    primary: true,
  })
  user: User;

  @ManyToOne({
    entity: () => Post,
    fieldName: 'post',
    onUpdateIntegrity: 'cascade',
    onDelete: 'cascade',
    nullable: false,
    primary: true,
  })
  post: Post;

  @Property({ columnType: 'boolean' })
  likes: boolean;
}
