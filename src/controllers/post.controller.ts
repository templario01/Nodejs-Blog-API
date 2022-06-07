import { plainToClass } from 'class-transformer'
import { Request, Response } from 'express'
import { CreatePostRequest } from '../dtos/post/request/create-post.dto'
import { UpdatePostRequest } from '../dtos/post/request/update-post.dto'
import { PostService } from '../services/post.service'
import { ReactionsService } from '../services/reactions.service'
import { UserWithRole } from '../services/user.service'

export async function createPost(req: Request, res: Response): Promise<void> {
  const request = plainToClass(CreatePostRequest, req.body)
  await request.isValid()
  const result = await PostService.createPost(request, req.query.id as string)
  res.status(201).json(result)
}

export async function getAllPosts(req: Request, res: Response): Promise<void> {
  const result = await PostService.getAllPosts(
    Number(req.query?.skip),
    Number(req.query?.pageNumber),
  )
  res.status(201).json(result)
}

export async function getPost(req: Request, res: Response): Promise<void> {
  const result = await PostService.getPostById(req.query.id as string)
  res.status(201).json(result)
}

export async function updatePost(req: Request, res: Response): Promise<void> {
  const request = plainToClass(UpdatePostRequest, req.body)
  await request.isValid()
  const result = await PostService.updatePost(request, req.query.id as string)
  res.status(201).json(result)
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  const result = await PostService.changeToDeleted(req.query.id as string)
  res.status(201).json(result)
}

export async function setLikeToPost(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.user as UserWithRole
  const result = await ReactionsService.setLikeToPost(
    id,
    String(req.query.id) as string,
  )
  res.status(201).json(result)
}

export async function setDislikeToPost(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.user as UserWithRole
  const result = await ReactionsService.setDislikeToPost(
    id,
    req.query.id as string,
  )
  res.status(201).json(result)
}
