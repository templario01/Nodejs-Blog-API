import { Request } from 'express'
import passport from 'passport'
import {
  ExtractJwt,
  Strategy as JWTStrategy,
  VerifiedCallback,
} from 'passport-jwt'
import { UserService, UserWithRole } from '../services/user.service'

export default new JWTStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_KEY,
  },
  async (payload, done: VerifiedCallback) => {
    try {
      const user = (await UserService.findUserById(payload.id)) as UserWithRole
      return user ? done(null, user) : done(null, false)
    } catch (error) {
      return done(error)
    }
  },
)

export const UserAuth = passport.authenticate('authGuard', { session: false })
export interface RequestSession extends Request {
  user: UserWithRole
}
