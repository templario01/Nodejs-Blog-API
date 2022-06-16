import { PostStatus } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { BaseDto } from '../../baste.dto'

@Exclude()
export class UpdatePostRequest extends BaseDto {
  @Expose()
  @IsOptional()
  @IsString()
  readonly title: string

  @Expose()
  @IsString()
  @IsOptional()
  readonly content: string

  @Expose()
  @IsOptional()
  @IsEnum(() => PostStatus, {
    message: 'Supported values: PUBLISHED or DRAFT',
  })
  readonly postStatus: PostStatus
}
