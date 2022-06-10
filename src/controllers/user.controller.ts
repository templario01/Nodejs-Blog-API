import { plainToClass } from 'class-transformer'
import { Request, Response } from 'express'
import { CreateUserImageRequest } from '../dtos/attachment/create-attachment.dto'
import { UpdateUserImageRequest } from '../dtos/attachment/update-attachment.dto'
import { UpdateUserRequest } from '../dtos/user/request/update-account.dto'
import { UserService, UserWithRole } from '../services/user.service'

export async function getProfileById(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await UserService.findUserWithProfileById(
    req.query.id as string,
  )
  res.status(201).json(result)
}

export async function getMyProfile(req: Request, res: Response): Promise<void> {
  const { id } = req.user as UserWithRole
  const result = await UserService.findUserWithProfileById(id)
  res.status(201).json(result)
}

export async function updateProfile(
  req: Request,
  res: Response,
): Promise<void> {
  const request = plainToClass(UpdateUserRequest, req.body)
  await request.isValid()
  const result = await UserService.updateUser(request, req.query.id as string)
  res.status(201).json(result)
}

export async function createImage(req: Request, res: Response): Promise<void> {
  const { id } = req.user as UserWithRole
  const request = plainToClass(CreateUserImageRequest, req.body)
  await request.isValid()
  const result = await UserService.saveProfileImage(request, id)
  res.status(201).json(result)
}

export async function updateImage(req: Request, res: Response): Promise<void> {
  const { id } = req.user as UserWithRole
  const request = plainToClass(UpdateUserImageRequest, req.body)
  await request.isValid()
  const result = await UserService.updateProfileImage(request, id)
  res.status(201).json(result)
}
