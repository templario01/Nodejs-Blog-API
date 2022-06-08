import express, { Router } from 'express'
import { authRoutes } from './routes/auth.routes'
import { commentRoutes } from './routes/comment.routes'
import { postRoutes } from './routes/post.routes'
import { userRoutes } from './routes/user.routes'

const expressRouter = express.Router()

export function router(app: Router): Router {
  app.use('/api/v1/auth', authRoutes())
  app.use('/api/v1/account', userRoutes())
  app.use('/api/v1/post', postRoutes())
  app.use('/api/v1/comment', commentRoutes())

  return expressRouter
}
