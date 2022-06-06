import { PostStatus } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { BaseDto } from '../../baste.dto'

@Exclude()
export class CreateCommentRequest extends BaseDto {
  @Expose()
  @IsString()
  readonly content: string

  @Expose()
  @IsEnum(() => PostStatus, {
    message: 'Supported values: PUBLISHED or DRAFT',
  })
  @IsNotEmpty()
  readonly commentStatus: PostStatus
}
