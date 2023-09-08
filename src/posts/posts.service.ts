import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { EntityRepository, SelectQueryBuilder } from '@mikro-orm/mariadb';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ImageService } from 'src/commons/image/image.service';
import { LikePostDto } from './dto/like-post.dto';
import { LikePost } from './entities/like-post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: EntityRepository<Post>,
    @InjectRepository(LikePost)
    private readonly likePostRepo: EntityRepository<LikePost>,
    private readonly imageService: ImageService,
    @Inject('BING_TOKEN') private readonly bingToken: string,
  ) {}

  private createPostSelect(authUser: User): SelectQueryBuilder<Post> {
    return this.postRepo
      .createQueryBuilder('p')
      .select('*')
      .leftJoinAndSelect('p.creator', 'c')
      .addSelect(`c.id = ${+authUser.id} AS mine`)
      .addSelect(
        `(SELECT likes FROM user_like_post WHERE user = ${+authUser.id} AND post = p.id) AS voted`,
      );
  }

  private checkPostExistOwned(post: Post, authUser: User) {
    if (!post) {
      throw new NotFoundException({
        status: 404,
        error: 'Post not found',
      });
    }
    if (authUser.id != post.creator.id) {
      throw new ForbiddenException({
        status: 403,
        error: "This post doesn't belong to you. You can't delete it",
      });
    }
  }

  findAll(authUser: User) {
    return this.createPostSelect(authUser).getResultList();
  }

  findByCreator(idUser: number, authUser: User) {
    return this.createPostSelect(authUser)
      .where({ creator: { id: idUser } })
      .getResultList();
  }

  async findOne(id: number, authUser: User) {
    const post = await this.createPostSelect(authUser)
      .where({ id })
      .getSingleResult();
    if (!post) {
      throw new NotFoundException({
        status: 404,
        error: 'Post not found',
      });
    }
    return post;
  }

  async create(createPostDto: CreatePostDto, authUser: User) {
    if (createPostDto.lat && createPostDto.lng) {
      const latlon = createPostDto.lat + ',' + createPostDto.lng;
      const img = `https://dev.virtualearth.net/REST/v1/Imagery/Map/Road/${latlon}/15?mapSize=800,400&pp=${latlon};66&mapLayer=Basemap,Buildings&key=${this.bingToken}`;
      createPostDto.image = await this.imageService.downloadImage('posts', img);
    } else if (createPostDto.image) {
      createPostDto.image = await this.imageService.saveImage(
        'posts',
        createPostDto.image,
      );
    }

    createPostDto.creator = authUser;
    const post = Post.fromDto(createPostDto);

    await this.postRepo.getEntityManager().persistAndFlush(post);
    post.mine = true;
    post.voted = null;
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto, authUser: User) {
    const post = await this.findOne(id, authUser);
    this.checkPostExistOwned(post, authUser);
    if (
      updatePostDto.lat &&
      updatePostDto.lng &&
      (updatePostDto.lat != post.lat || updatePostDto.lng != post.lng)
    ) {
      const latlon = updatePostDto.lat + ',' + updatePostDto.lng;
      const img = `https://dev.virtualearth.net/REST/v1/Imagery/Map/Road/${latlon}/15?mapSize=800,400&pp=${latlon};66&mapLayer=Basemap,Buildings&key=${this.bingToken}`;
      post.image = await this.imageService.downloadImage('posts', img);
    } else if (updatePostDto.image && !updatePostDto.image.startsWith('http')) {
      post.image = await this.imageService.saveImage(
        'posts',
        updatePostDto.image,
      );
    }
    post.place = updatePostDto.place;
    post.title = updatePostDto.title;
    post.description = updatePostDto.description;
    this.postRepo.getEntityManager().flush();
    return post;
  }

  async remove(id: number, authUser: User) {
    const post = await this.findOne(id, authUser);
    this.checkPostExistOwned(post, authUser);
    await this.postRepo.getEntityManager().removeAndFlush(post);
  }

  async likePost(likePostDto: LikePostDto, idPost: number, authUser: User) {
    let likePost = await this.likePostRepo.findOne({
      post: { id: idPost },
      user: { id: authUser.id },
    });
    if (!likePost) {
      likePost = new LikePost();
      likePost.post = await this.postRepo.findOne(idPost);
      if (!likePost.post) {
        throw new NotFoundException({
          status: 404,
          error: 'Post not found',
        });
      }
      likePost.user = authUser;
      likePost.likes = likePostDto.likes;
      await this.likePostRepo.getEntityManager().persistAndFlush(likePost);
      likePost.post.totalLikes += likePost.likes ? 1 : -1;
    } else {
      likePost.likes = likePostDto.likes;
      await this.likePostRepo.getEntityManager().flush();
    }

    return (await this.postRepo.findOne(idPost)).totalLikes;
  }

  async deleteLikePost(postId: number, authUser: User) {
    await this.likePostRepo
      .createQueryBuilder()
      .delete()
      .where({ user: { id: authUser.id }, post: { id: postId } })
      .execute();
    return (await this.postRepo.findOne(postId)).totalLikes;
  }
}
