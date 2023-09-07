import { IsNotEmpty } from 'class-validator';

export class LikePostDto {
  @IsNotEmpty()
  likes: boolean;
}
