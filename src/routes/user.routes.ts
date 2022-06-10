import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'
import {
  getMyProfile,
  getProfileById,
  updateProfile,
  createImage,
  updateImage,
} from '../controllers/user.controller'
import { UserAuth } from '../guards/authentication.guard'

const router: Router = Router()

export function userRoutes(): Router {
  router.route('/me').get([UserAuth], expressAsyncHandler(getMyProfile))

  router
    .route('/:id')
    .get(expressAsyncHandler(getProfileById))
    .patch([UserAuth], expressAsyncHandler(updateProfile))

  router
    .route('/signed-url')
    .all([UserAuth])
    .post(expressAsyncHandler(createImage))
    .patch(expressAsyncHandler(updateImage))

  return router
}
