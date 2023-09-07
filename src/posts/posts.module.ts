import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { CommonsModule } from 'src/commons/commons.module';
import { CommentsModule } from 'src/comments/comments.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { LikePost } from './entities/like-post.entity';
import { Post } from './entities/post.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Post, LikePost]),
    CommonsModule,
    CommentsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
