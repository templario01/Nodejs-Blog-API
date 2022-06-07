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
    secretOrKey: 'holavictor',
  },
  async (payload, done: VerifiedCallback) => {
    try {
      const user = await UserService.findUserById(payload.id)
      return user ? done(null, user) : done(null, false)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
      return done(error)
    }
  },
)

export const UserAuth = passport.authenticate('authGuard', { session: false })
export interface RequestSession extends Request {
  user: UserWithRole
}
