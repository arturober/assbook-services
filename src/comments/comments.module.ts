import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { CommonsModule } from 'src/commons/commons.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Comment } from './entities/comment.entity';
import { CommentResponseInterceptor } from './interceptors/comment-response.interceptor';

@Module({
  imports: [MikroOrmModule.forFeature([Comment, User, Post]), CommonsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService, CommentResponseInterceptor],
})
export class CommentsModule {}
