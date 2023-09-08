import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserResponseInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return { users: data.map((u) => this.transformImageUrl(req, u)) };
        } else if (data.following?.follower) {
          data.following.follower = this.transformImageUrl(
            req,
            data.following.follower,
          );
          data.following.followed = this.transformImageUrl(
            req,
            data.following.followed,
          );
          return data;
        } else if (data.followers) {
          data.followers = data.followers.map((u) =>
            this.transformImageUrl(req, u),
          );
          return data;
        } else if (data.followed) {
          data.followed = data.followed.map((u) =>
            this.transformImageUrl(req, u),
          );
          return data;
        } else {
          return { user: this.transformImageUrl(req, data) };
        }
      }),
    );
  }

  private transformImageUrl(req, user: User) {
    const baseUrl = `${req.protocol}://${
      req.headers.host
    }/${this.configService.get<string>('basePath')}`;
    user.avatar = user.avatar && baseUrl + user.avatar;
    return user;
  }
}
