import {
  IsString,
  ValidateIf,
  IsNumber,
  IsOptional,
  Allow,
} from 'class-validator';
import { User } from '../../users/entities/user.entity';

export class CreatePostDto {
  @IsString()
  @ValidateIf((p) => !p.description && !p.image && !p.place)
  title: string;

  @IsString()
  @ValidateIf((p) => !p.title && !p.image && !p.place)
  description: string;

  @IsString()
  @ValidateIf((p) => !p.title && !p.description && !p.place)
  image: string;

  @IsOptional()
  @IsString()
  place: string;

  @IsOptional()
  @IsNumber()
  lat: number;

  @IsOptional()
  @IsNumber()
  lng: number;

  @Allow()
  creator: User;
}
