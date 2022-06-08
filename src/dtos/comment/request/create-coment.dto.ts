import { PostStatus } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { BaseDto } from '../../baste.dto'

@Exclude()
export class CreateCommentRequest extends BaseDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  readonly content: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  readonly postId: string

  @Expose()
  @IsNotEmpty()
  @IsEnum(() => PostStatus, {
    message: 'Supported values: PUBLISHED or DRAFT',
  })
  @IsNotEmpty()
  readonly commentStatus: PostStatus
}
