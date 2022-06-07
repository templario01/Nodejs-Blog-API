import express, { Router } from 'express'
import { authRoutes } from './routes/auth.routes'
import { postRoutes } from './routes/post.routes'

const expressRouter = express.Router()

export function router(app: Router): Router {
  app.use('/api/v1/auth', authRoutes())
  app.use('/api/v1/account', postRoutes())
  // app.use('/api/v1/post', postRoutes())
  // app.use('/api/v1/comment', postRoutes())

  return expressRouter
}
