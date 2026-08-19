import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { scoresRouter } from './routes/scores.js'
import './db.js'

const app = express()
const PORT = Number(process.env.PORT ?? 3001)

if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))
}

app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/scores', scoresRouter)

app.listen(PORT, () => {
  console.log(`MakeEleven backend démarré sur le port ${PORT}`)
})
