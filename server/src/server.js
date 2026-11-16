
import { pathToFileURL } from 'node:url'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import reportRoutes from './routes/reportRoutes.js'
import alertRoutes from './routes/alertRoutes.js'
import weatherRoutes from './routes/weatherRoutes.js'
import riskRoutes from './routes/riskRoutes.js'
import authRoutes from './routes/authRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import roadsRoutes from './routes/roadsRoutes.js'
import villagesRoutes from './routes/villagesRoutes.js'
import infrastructureRoutes from './routes/infrastructureRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'

dotenv.config({
  path: new URL(
    process.env.NODE_ENV === 'test'
      ? '../.env.test'
      : '../.env',
    import.meta.url
  ),
})

const app = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim())
  : []

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        process.env.NODE_ENV !== 'production' ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true)
      }

      return callback(new Error('Origin not allowed by CORS'))
    },
  })
)

app.use(express.json({ limit: '1mb' }))

app.use((request, response, next) => {
  console.log('REQUEST RECEIVED:', request.method, request.url)
  next()
})

app.get('/api/health', (request, response) => {
  response.status(200).json({
    success: true,
    message: 'TerraWatch backend is running',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/weather', weatherRoutes)
app.use('/api/risk', riskRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/roads', roadsRoutes)
app.use('/api/villages', villagesRoutes)
app.use('/api/infrastructure', infrastructureRoutes)
app.use('/api/settings', settingsRoutes)

app.use((request, response) => {
  response.status(404).json({
    success: false,
    message: 'API route not found',
  })
})

app.use((error, request, response, next) => {
  console.error('API Error:', error)

  if (response.headersSent) {
    return next(error)
  }

  const status = error.status || 500

  response.status(status).json({
    success: false,
    message:
      status >= 500
        ? 'Internal server error'
        : error.message,
  })
})

export default app

const isMainModule =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href

if (isMainModule) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TerraWatch API is running on port ${PORT}`)
  })
}
