import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'
import {
  CreateComment,
  markCommentAsDeleted,
  setDislikeToComment,
  setLikeToComment,
  UpdateComment,
} from '../controllers/comment.controller'
import { UserAuth } from '../guards/authentication.guard'

const router: Router = Router()

export function commentRoutes(): Router {
  router.route('/').post([UserAuth], expressAsyncHandler(CreateComment))

  router
    .route('/:id')
    .all([UserAuth])
    .patch(expressAsyncHandler(UpdateComment))
    .delete(expressAsyncHandler(markCommentAsDeleted))

  router
    .route('/:id/like')
    .put([UserAuth], expressAsyncHandler(setLikeToComment))

  router
    .route('/:id/dislike')
    .put([UserAuth], expressAsyncHandler(setDislikeToComment))

  return router
}
