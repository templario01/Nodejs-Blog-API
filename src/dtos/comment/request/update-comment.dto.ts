import { IsNotEmpty, IsString } from 'class-validator'
import { CreateCommentRequest } from './create-coment.dto'

export class UpdateCommentRequest extends CreateCommentRequest {
  @IsNotEmpty()
  @IsString()
  commentId: string
}
