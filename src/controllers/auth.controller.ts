import { plainToClass } from 'class-transformer'
import { Request, Response } from 'express'
import { CreateUserRequest } from '../dtos/user/request/create-account.dto'
import { SignInRequest } from '../dtos/user/request/signin-request.dto'
import { AuthService } from '../services/auth.service'
import { UserWithRole } from '../services/user.service'

export async function SignUp(req: Request, res: Response): Promise<void> {
  const request = plainToClass(CreateUserRequest, req.body)
  await request.isValid()
  const result = await AuthService.signUp(request)
  res.status(201).json(result)
}

export async function SignIn(req: Request, res: Response): Promise<void> {
  const request = plainToClass(SignInRequest, req.body)
  await request.isValid()
  const result = await AuthService.signIn(request)
  res.status(201).json(result)
}

export async function logOut(req: Request, res: Response): Promise<void> {
  const { id } = req.user as UserWithRole
  const result = await AuthService.logOut(id)
  res.status(201).json({ end_session: result })
}

export async function getAccessToken(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await AuthService.getNewAccessToken(req.body.refresh_token)
  res.status(201).json(result)
}
