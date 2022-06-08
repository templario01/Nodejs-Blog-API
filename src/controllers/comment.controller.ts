import { plainToClass } from 'class-transformer'
import { Request, Response } from 'express'
import { CreateCommentRequest } from '../dtos/comment/request/create-coment.dto'
import { UpdateCommentRequest } from '../dtos/comment/request/update-comment.dto'
import { CommentService } from '../services/comment.service'
import { ReactionsService } from '../services/reactions.service'
import { UserWithRole } from '../services/user.service'

export async function CreateComment(
  req: Request,
  res: Response,
): Promise<void> {
  const request = plainToClass(CreateCommentRequest, req.body)
  await request.isValid()
  const { id } = req.user as UserWithRole
  const result = await CommentService.createComment(
    request,
    id,
    req.query.id as string,
  )
  res.status(201).json(result)
}

export async function UpdateComment(
  req: Request,
  res: Response,
): Promise<void> {
  const request = plainToClass(UpdateCommentRequest, req.body)
  await request.isValid()
  const { id } = req.user as UserWithRole
  const result = await CommentService.updateComment(
    request,
    req.query.id as string,
    id,
  )
  res.status(201).json(result)
}

export async function markCommentAsDeleted(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.user as UserWithRole
  const result = await CommentService.changeToDeleted(
    req.query.id as string,
    id,
  )
  res.status(201).json(result)
}

export async function setLikeToComment(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.user as UserWithRole
  const result = await ReactionsService.setLikeToComment(
    id,
    String(req.query.id) as string,
  )
  res.status(201).json(result)
}

export async function setDislikeToComment(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.user as UserWithRole
  const result = await ReactionsService.setDislikeToComment(
    id,
    req.query.id as string,
  )
  res.status(201).json(result)
}
