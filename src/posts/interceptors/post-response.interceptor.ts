import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Post } from '../entities/post.entity';
import { ConfigService } from '@nestjs/config';
import { LikePostDto } from '../dto/like-post.dto';

@Injectable()
export class PostResponseInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data: Post | Post[]) => {
        if (Array.isArray(data)) {
          return {
            posts: data.map((p) => {
              this.formatVotedField(p);
              return this.transformImageUrl(req, p);
            }),
          };
        } else {
          this.formatVotedField(data);
          return { post: this.transformImageUrl(req, data) };
        }
      }),
    );
  }

  private formatVotedField(post: Post) {
    if (post.voted !== null) {
      const likepost = new LikePostDto();
      likepost.likes = !!post.voted;
      post.voted = likepost;
    }
  }

  private transformImageUrl(req, post: Post) {
    const baseUrl = `${req.protocol}://${
      req.headers.host
    }/${this.configService.get<string>('basePath')}`;
    if (post.image) {
      post.image = baseUrl + post.image;
    }
    if (
      post.creator &&
      post.creator.avatar &&
      !post.creator.avatar.startsWith('http')
    ) {
      post.creator.avatar = baseUrl + post.creator.avatar;
    }

    return post;
  }
}
