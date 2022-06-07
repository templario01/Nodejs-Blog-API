import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'
import {
  getMyProfile,
  getProfileById,
  updateProfile,
} from '../controllers/user.controller'
import { UserAuth } from '../guards/authentication.guard'

const router: Router = Router()

export function userRoutes(): Router {
  router.route('/me').get([UserAuth], expressAsyncHandler(getMyProfile))

  router
    .route('/:id')
    .get(expressAsyncHandler(getProfileById))
    .patch(expressAsyncHandler(updateProfile))

  return router
}
