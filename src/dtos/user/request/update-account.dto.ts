import { ProfileView } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { BaseDto } from '../../baste.dto'

@Exclude()
export class UpdateUserRequest extends BaseDto {
  @Expose()
  @IsString()
  @IsOptional()
  readonly firstName: string

  @Expose()
  @IsString()
  @IsOptional()
  readonly lastName: string

  @Expose()
  @IsString()
  @IsOptional()
  readonly password: string

  @Expose()
  @IsEnum(() => ProfileView, {
    message: 'Supported values: PRIVATE or PUBLIC',
  })
  readonly view: ProfileView
}
