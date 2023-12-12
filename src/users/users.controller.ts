import {
  Controller,
  Get,
  Req,
  Param,
  ParseIntPipe,
  NotFoundException,
  Put,
  Body,
  ValidationPipe,
  BadRequestException,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  Post,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { AuthUser } from 'src/auth/decorators/user.decorator';
import { UserResponseInterceptor } from './interceptors/user-response.interceptor';
import { Request } from 'express';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private configService: ConfigService,
  ) {}

  @Get('me')
  @UseInterceptors(UserResponseInterceptor, ClassSerializerInterceptor)
  getCurrentUser(@AuthUser() authUser: User): User {
    authUser.me = true;
    return authUser;
  }

  @Get('name/:name')
  @UseInterceptors(UserResponseInterceptor, ClassSerializerInterceptor)
  async getUsersByName(
    @AuthUser() authUser: User,
    @Param('name') name: string,
  ): Promise<User[]> {
    const users = await this.usersService.getUsersByName(name);
    return users;
  }

  @Get(':id')
  @UseInterceptors(UserResponseInterceptor, ClassSerializerInterceptor)
  async getUser(
    @AuthUser() authUser: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User> {
    try {
      const user = await this.usersService.getUser(id);
      user.me = id === authUser.id;
      return user;
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @Put('me')
  @HttpCode(204)
  async updateUserInfo(
    @AuthUser() authUser: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    userDto: UpdateUserDto,
  ): Promise<void> {
    try {
      await this.usersService.updateUserInfo(authUser.id, userDto);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('This email is already registered');
      } else {
        throw new NotFoundException();
      }
    }
  }

  @Put('me/password')
  @HttpCode(204)
  async updatePassword(
    @AuthUser() authUser: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    passDto: UpdatePasswordDto,
  ): Promise<void> {
    try {
      await this.usersService.updatePassword(authUser.id, passDto);
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @Put('me/avatar')
  async updateAvatar(
    @AuthUser() authUser: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    photoDto: UpdatePhotoDto,
    @Req() req: Request,
  ) {
    try {
      const avatar = await this.usersService.updatePhoto(authUser.id, photoDto);
      return {
        avatar:
          req.protocol +
          '://' +
          req.headers.host +
          '/' +
          this.configService.get<string>('basePath') +
          avatar,
      };
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @Get('me/followers')
  @UseInterceptors(UserResponseInterceptor, ClassSerializerInterceptor)
  async getMyFollowers(@AuthUser() authUser: User) {
    return await this.usersService.getFollowers(authUser.id);
  }

  @Get('me/following')
  @UseInterceptors(UserResponseInterceptor, ClassSerializerInterceptor)
  async getMyFollowing(@AuthUser() authUser: User) {
    return await this.usersService.getFollowed(authUser.id);
  }

  @Get(':id/follow')
  @UseInterceptors(UserResponseInterceptor, ClassSerializerInterceptor)
  async isFollowing(
    @AuthUser() authUser: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.usersService.isFollowing(id, authUser);
  }

  @Post(':id/follow')
  @UseInterceptors(UserResponseInterceptor, ClassSerializerInterceptor)
  async follow(
    @AuthUser() authUser: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.usersService.follow(id, authUser);
  }

  @Delete(':id/follow')
  @HttpCode(204)
  async unfollow(@Req() req, @Param('id', ParseIntPipe) id: number) {
    await this.usersService.unfollow(id, req.user);
  }
}
