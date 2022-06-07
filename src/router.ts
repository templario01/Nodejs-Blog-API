import express, { Router } from 'express'
import { postRoutes } from './routes/post.route'

const expressRouter = express.Router()

export function router(app: Router): Router {
  app.use('/api/v1/auth', postRoutes())
  app.use('/api/v1/account', postRoutes())
  app.use('/api/v1/post', postRoutes())
  app.use('/api/v1/comment', postRoutes())

  return expressRouter
}
