import { Exclude, Expose } from 'class-transformer'
import { IsEmail, IsOptional, IsString } from 'class-validator'
import { BaseDto } from '../../baste.dto'

@Exclude()
export class CreateUserRequest extends BaseDto {
  @Expose()
  @IsString()
  @IsOptional()
  readonly firstName: string

  @Expose()
  @IsString()
  @IsOptional()
  readonly lastName: string

  @Expose()
  @IsEmail()
  @IsString()
  readonly email: string

  @Expose()
  @IsString()
  readonly password: string
}
