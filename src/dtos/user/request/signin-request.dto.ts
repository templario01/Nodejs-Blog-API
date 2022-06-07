import { Exclude, Expose } from 'class-transformer'
import { IsEmail, IsString } from 'class-validator'
import { BaseDto } from '../../baste.dto'

@Exclude()
export class SignInRequest extends BaseDto {
  @Expose()
  @IsEmail()
  @IsString()
  readonly email: string

  @Expose()
  @IsString()
  readonly password: string
}
