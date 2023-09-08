import { Entity, ManyToOne } from '@mikro-orm/core';
import { User } from './user.entity';

@Entity({ tableName: 'user_follow_user' })
export class UserFollow {
  @ManyToOne({
    entity: () => User,
    fieldName: 'follower',
    onUpdateIntegrity: 'cascade',
    onDelete: 'cascade',
    nullable: false,
    primary: true,
  })
  follower: User;

  @ManyToOne({
    entity: () => User,
    fieldName: 'followed',
    onUpdateIntegrity: 'cascade',
    onDelete: 'cascade',
    nullable: false,
    primary: true,
  })
  followed: User;
}
