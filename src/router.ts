import express, { Router } from 'express'
import { postRoutes } from './routes/post.route'

const expressRouter = express.Router()

export function router(app: Router): Router {
  // put all routes here
  app.use('/api/v1/post', postRoutes())

  return expressRouter
}
