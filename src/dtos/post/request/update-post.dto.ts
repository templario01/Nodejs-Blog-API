import { IsNotEmpty, IsString } from 'class-validator'
import { CreatePostRequest } from './create-post.dto'

export class UpdatePostRequest extends CreatePostRequest {
  @IsNotEmpty()
  @IsString()
  postId: string
}
