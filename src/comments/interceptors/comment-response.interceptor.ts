import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, map } from 'rxjs';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentResponseInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data: Comment | Comment[]) => {
        if (Array.isArray(data)) {
          return {
            comments: data.map((p) => {
              return this.transformImageUrl(req, p);
            }),
          };
        } else {
          return { comment: this.transformImageUrl(req, data) };
        }
      }),
    );
  }

  private transformImageUrl(req, comment: Comment) {
    const baseUrl = `${req.protocol}://${
      req.headers.host
    }/${this.configService.get<string>('basePath')}`;
    if (comment.user && comment.user.avatar) {
      comment.user.avatar = baseUrl + comment.user.avatar;
    }

    return comment;
  }
}
