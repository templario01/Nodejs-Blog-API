import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'
import {
  getAccessToken,
  logOut,
  SignIn,
  SignUp,
} from '../controllers/auth.controller'

import { UserAuth } from '../guards/authentication.guard'

const router: Router = Router()

export function authRoutes(): Router {
  router.route('/signup').post(expressAsyncHandler(SignUp))
  router.route('/signin').post(expressAsyncHandler(SignIn))
  router.route('/refresh-token').post(expressAsyncHandler(getAccessToken))
  router.route('/logout').post([UserAuth], expressAsyncHandler(logOut))

  return router
}
