import { Exclude } from 'class-transformer'
import { CreateUserImageRequest } from './create-attachment.dto'

@Exclude()
export class UpdateUserImageRequest extends CreateUserImageRequest {}
