import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly comRepo: EntityRepository<Comment>,
    @InjectRepository(User) private readonly usersRepo: EntityRepository<User>,
    @InjectRepository(Post) private readonly postRepo: EntityRepository<Post>,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    idPost: number,
    authUser: User,
  ) {
    const comment = new Comment();
    comment.text = createCommentDto.text;
    comment.post = await this.postRepo.findOne(idPost);
    if (!comment.post) {
      throw new NotFoundException({
        status: 404,
        error: 'Post not found',
      });
    }
    comment.user = authUser;
    await this.comRepo.getEntityManager().persistAndFlush(comment);
    return comment;
  }

  findByPost(idPost: number) {
    return this.comRepo.find({ post: { id: idPost } }, { populate: ['user'] });
  }
}
