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

app.use(cors())
app.use(express.json())

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

export default app

// Start server only when this file is executed directly.
const isMainModule =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href

if (isMainModule) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TerraWatch API is running on http://localhost:${PORT}`)
  })
}
