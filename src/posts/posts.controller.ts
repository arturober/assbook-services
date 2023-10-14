import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AuthUser } from 'src/auth/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { LikePostDto } from './dto/like-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseInterceptor } from './interceptors/post-response.interceptor';
import { PostsService } from './posts.service';
import { CommentsService } from 'src/comments/comments.service';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { CommentResponseInterceptor } from 'src/comments/interceptors/comment-response.interceptor';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Post()
  @UseInterceptors(PostResponseInterceptor)
  create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createPostDto: CreatePostDto,
    @AuthUser() authUser: User,
  ) {
    return this.postsService.create(createPostDto, authUser);
  }

  @Get()
  @UseInterceptors(PostResponseInterceptor)
  findAll(@AuthUser() authUser: User) {
    return this.postsService.findAll(authUser);
  }

  @Get('mine')
  @UseInterceptors(PostResponseInterceptor)
  async findAllMine(@AuthUser() authUser: User) {
    return await this.postsService.findByCreator(authUser.id, authUser);
  }

  @Get('user/:id')
  @UseInterceptors(PostResponseInterceptor)
  async findByCreator(
    @Param('id', ParseIntPipe) userId: number,
    @AuthUser() authUser: User,
  ) {
    return await this.postsService.findByCreator(userId, authUser);
  }

  @Get(':id')
  @UseInterceptors(PostResponseInterceptor)
  findOne(
    @Param('id', ParseIntPipe) postId: number,
    @AuthUser() authUser: User,
  ) {
    return this.postsService.findOne(postId, authUser);
  }

  @Put(':id')
  @UseInterceptors(PostResponseInterceptor)
  update(
    @Param('id', ParseIntPipe) postId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    postDto: UpdatePostDto,
    @AuthUser() authUser: User,
  ) {
    return this.postsService.update(postId, postDto, authUser);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Param('id', ParseIntPipe) postId: number,
    @AuthUser() authUser: User,
  ) {
    await this.postsService.remove(postId, authUser);
  }

  @Post(':id/likes')
  async likePost(
    @Param('id', ParseIntPipe) postId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    liketDto: LikePostDto,
    @AuthUser() authUser: User,
  ) {
    return {
      totalLikes: await this.postsService.likePost(liketDto, postId, authUser),
    };
  }

  @Delete(':id/likes')
  async deleteLikePost(
    @Param('id', ParseIntPipe) postId: number,
    @AuthUser() authUser: User,
  ) {
    return {
      totalLikes: await this.postsService.deleteLikePost(postId, authUser),
    };
  }

  @Get(':id/comments')
  @UseInterceptors(CommentResponseInterceptor)
  getComments(@Param('id', ParseIntPipe) postId: number) {
    return this.commentsService.findByPost(postId);
  }

  @Post(':id/comments')
  @UseInterceptors(CommentResponseInterceptor)
  postComment(
    @Param('id', ParseIntPipe) postId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    comDto: CreateCommentDto,
    @AuthUser() authUser: User,
  ) {
    return this.commentsService.create(comDto, postId, authUser);
  }
}
