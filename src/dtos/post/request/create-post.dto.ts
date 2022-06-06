import { PostStatus } from '.prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { BaseDto } from '../../baste.dto'

@Exclude()
export class CreatePostRequest extends BaseDto {
  @Expose()
  @IsOptional()
  @IsString()
  readonly title: string

  @Expose()
  @IsString()
  @IsOptional()
  readonly content: string

  @Expose()
  @IsEnum(() => PostStatus, {
    message: 'Supported values: PUBLISHED or DRAFT',
  })
  @IsNotEmpty()
  readonly postStatus: PostStatus
}
