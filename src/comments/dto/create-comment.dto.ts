import { IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  readonly text: string;
}
