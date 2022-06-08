import { Exclude, Expose } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'
import { SignInRequest } from './signin-request.dto'

@Exclude()
export class VerifyAccountRequest extends SignInRequest {
  @Expose()
  @IsString()
  @IsNotEmpty()
  readonly code: string
}
