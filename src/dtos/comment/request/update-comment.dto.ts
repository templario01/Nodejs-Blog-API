import { PostStatus } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { BaseDto } from '../../baste.dto'

@Exclude()
export class UpdateCommentRequest extends BaseDto {
  @Expose()
  @IsString()
  @IsOptional()
  readonly content: string

  @IsOptional()
  @Expose()
  @IsEnum(() => PostStatus, {
    message: 'Supported values: PUBLISHED or DRAFT',
  })
  readonly commentStatus: PostStatus
}
