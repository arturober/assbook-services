import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Post } from '../entities/post.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostResponseInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data: Post | Post[]) => {
        if (Array.isArray(data)) {
          return { posts: data.map((p) => this.transformImageUrl(req, p)) };
        } else {
          return { post: this.transformImageUrl(req, data) };
        }
      }),
    );
  }

  private transformImageUrl(req, post) {
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
