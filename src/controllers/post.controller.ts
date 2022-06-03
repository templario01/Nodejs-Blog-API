import { plainToClass } from 'class-transformer'
import { Request, Response } from 'express'
import { CreatePostRequest } from '../dtos/post/request/create-post.dto'
import { PostService } from '../services/post.service'

export async function createPost(req: Request, res: Response): Promise<void> {
  console.log(req.params.id)
  const request = plainToClass(CreatePostRequest, req.params)
  await request.isValid()
  const result = await PostService.createPost(
    request,
    '263a5a8c-c92d-4f32-890b-61fccfc0f4d9',
  )

  res.status(201).json(result)
}
