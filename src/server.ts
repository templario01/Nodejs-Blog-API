import 'reflect-metadata'
import express, { Application, NextFunction, Request, Response } from 'express'
import passport from 'passport'
import cors, { CorsOptions } from 'cors'
import { HttpError } from 'http-errors'
import { plainToClass } from 'class-transformer'
import * as cron from 'node-cron'
import { HttpErrorDto } from './dtos/http-error.dto'
import { router } from './router'
import JWTStrategy from './guards/authentication.guard'
import { resetVerificationCodes } from './jobs/user.cron.'

const app: Application = express()
const PORT = process.env.PORT || 3000
const ENVIROMENT = process.env.NODE_ENV || 'development'

// // Middlewares
app.use(express.json())
app.use(passport.initialize())
passport.use('authGuard', JWTStrategy)

const whiteList = ['http://localhost:3000', 'http://localhost:3001']
const corsOptionsDelegate = function handler(
  req: Request,
  callback: (err: Error | null, options?: CorsOptions) => void,
) {
  const corsOptions: { origin: boolean } = { origin: false }

  if (whiteList.indexOf(req.header('Origin') ?? '') !== -1) {
    corsOptions.origin = true
  }

  callback(null, corsOptions)
}

function errorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void {
  if (ENVIROMENT !== 'development') {
    // eslint-disable-next-line no-console
    console.error(err.message)
    // eslint-disable-next-line no-console
    console.error(err.stack || '')
  }

  res.status(err.status ?? 500)
  res.json(plainToClass(HttpErrorDto, err))
}

app.use(cors(corsOptionsDelegate))

// Routes
app.get('/api/v1/status', (req: Request, res: Response) => {
  res.json({ time: new Date() })
})
app.use('/', router(app))
app.use(errorHandler)

// Cron jobs
cron.schedule('0 */3 * * *', resetVerificationCodes)

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port %d, env: %s 🚀`, PORT, ENVIROMENT)
})
