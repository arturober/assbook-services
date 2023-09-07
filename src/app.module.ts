import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { GOOGLE_ID_VALUE } from './google-id';
import mikroOrmConfig from './mikro-orm.config';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    PostsModule,
    UsersModule,
    CommentsModule,
    AuthModule.forRoot({
      googleId: GOOGLE_ID_VALUE,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
