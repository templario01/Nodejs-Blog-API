import { UserRole } from '@prisma/client'
import { Response } from 'express'
import { VerifiedCallback } from 'passport-jwt'
import { RequestSession } from './authentication.guard'

export const AdminGuard = async (
  req: RequestSession,
  res: Response,
  done: VerifiedCallback,
) => {
  const admin = req.user.role.some((elem) => elem.name === UserRole.ADMIN)

  if (!admin) {
    return res.status(405).json({ message: 'Unauthorized, just admins' })
  }
  done(null, req.user)
}
