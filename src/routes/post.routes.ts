import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  setDislikeToPost,
  setLikeToPost,
  updatePost,
} from '../controllers/post.controller'
import { UserAuth } from '../guards/authentication.guard'

const router: Router = Router()

export function postRoutes(): Router {
  router
    .route('/')
    .get(expressAsyncHandler(getAllPosts))
    .post([UserAuth], expressAsyncHandler(createPost))

  router
    .route('/:id')
    .get(expressAsyncHandler(getPost))
    .patch([UserAuth], expressAsyncHandler(updatePost))
    .delete([UserAuth], expressAsyncHandler(deletePost))

  router.route('/:id/like').put([UserAuth], expressAsyncHandler(setLikeToPost))

  router
    .route('/:id/dislike')
    .put([UserAuth], expressAsyncHandler(setDislikeToPost))

  return router
}
