import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'
import { createPost } from '../controllers/post.controller'

const router: Router = Router()

export function postRoutes(): Router {
  router.route('/:id').post(expressAsyncHandler(createPost))

  return router
}
