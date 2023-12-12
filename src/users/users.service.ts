import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { ImageService } from 'src/commons/image/image.service';
import { User } from './entities/user.entity';
import { UserFollow } from './entities/user-follow.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly imageService: ImageService,
    @InjectRepository(User) private readonly usersRepo: EntityRepository<User>,
    @InjectRepository(UserFollow)
    private readonly userFollowRepo: EntityRepository<UserFollow>,
  ) {}

  async getUser(id: number): Promise<User> {
    return this.usersRepo.findOneOrFail({ id });
  }

  async getUserbyEmail(email: string): Promise<User> {
    return this.usersRepo.findOne({ email });
  }

  async getUsersByName(name: string): Promise<User[]> {
    return this.usersRepo.find({ name: { $like: '%' + name + '%' } });
  }

  async emailExists(email: string): Promise<boolean> {
    return (await this.usersRepo.findOne({ email })) ? true : false;
  }

  async updateUserInfo(id: number, user: UpdateUserDto): Promise<void> {
    await this.usersRepo.nativeUpdate({ id }, user);
  }

  async updatePassword(id: number, pass: UpdatePasswordDto): Promise<void> {
    await this.usersRepo.nativeUpdate({ id }, pass);
  }

  async updatePhoto(id: number, photoDto: UpdatePhotoDto): Promise<string> {
    photoDto.avatar = await this.imageService.saveImage(
      'users',
      photoDto.avatar,
    );
    await this.usersRepo.nativeUpdate(id, photoDto);
    return photoDto.avatar;
  }

  async getFollowed(id: number) {
    const follows = await this.userFollowRepo.findAndCount(
      { follower: { id } },
      { populate: ['followed'] },
    );
    return {
      followed: follows[0].map((f) => f.followed),
      followedCount: follows[1],
    };
  }

  async getFollowers(id: number) {
    const follows = await this.userFollowRepo.findAndCount(
      { followed: { id } },
      { populate: ['follower'] },
    );
    return {
      followers: follows[0].map((f) => f.follower),
      followerCount: follows[1],
    };
  }

  async isFollowing(id: number, loggedUser: User) {
    const userFollow = await this.userFollowRepo.findOne({
      follower: loggedUser,
      followed: { id },
    });

    return { following: !!userFollow };
  }

  async follow(id: number, loggedUser: User) {
    const followed = await this.usersRepo.findOne(id);
    if (!followed) {
      throw new NotFoundException({
        status: 404,
        error: 'User not found',
      });
    }
    let userFollow = await this.userFollowRepo.findOne(
      {
        follower: loggedUser,
        followed,
      },
      { populate: ['follower', 'followed'] },
    );
    if (!userFollow) {
      userFollow = new UserFollow();
      userFollow.follower = loggedUser;
      userFollow.followed = followed;
      await this.userFollowRepo.getEntityManager().persistAndFlush(userFollow);
    }
  }

  async unfollow(id: number, loggedUser: User) {
    const userFollow = await this.userFollowRepo.findOne({
      follower: loggedUser,
      followed: { id },
    });
    if (userFollow) {
      await this.userFollowRepo.getEntityManager().removeAndFlush(userFollow);
    }
  }
}
