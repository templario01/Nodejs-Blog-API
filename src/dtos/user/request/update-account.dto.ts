import { Exclude, Expose } from 'class-transformer'
import { IsOptional, IsString } from 'class-validator'

@Exclude()
export class UpdateUserRequest {
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
  @IsString()
  readonly userId: string
}
