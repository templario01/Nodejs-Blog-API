import 'reflect-metadata'
import express, { Application, Request, Response } from 'express'
import passport from 'passport'
import cors, { CorsOptions } from 'cors'

const app: Application = express()
const PORT = process.env.PORT || 3000
const ENVIROMENT = process.env.NODE_ENV || 'development'

// // Middlewares
app.use(express.json())
app.use(passport.initialize())

const whiteList = ['http://localhost:3000']
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

app.use(cors(corsOptionsDelegate))

// Routes
app.get('/api/v1/status', (req: Request, res: Response) => {
  res.json({ time: new Date() })
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port %d, env: %s 🚀`, PORT, ENVIROMENT)
})
