import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import reportRoutes from './routes/reportRoutes.js'
import alertRoutes from './routes/alertRoutes.js'
import weatherRoutes from './routes/weatherRoutes.js'
import riskRoutes from './routes/riskRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use((request, response, next) => {
  console.log('🔥 REQUEST RECEIVED:', request.method, request.url)
  next()
})

app.get('/api/health', (request, response) => {
  console.log('🔥 THIS IS MY TERRAWATCH SERVER')
  response.status(200).json({
    success: true,
    message: 'TerraWatch backend is running',
    timestamp: new Date().toISOString(),
  })
})


app.use('/api/reports', reportRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/weather', weatherRoutes)
app.use('/api/risk', riskRoutes)

console.log('REPORT ROUTER MOUNTED')
console.log('ALERT ROUTER MOUNTED')
console.log('WEATHER ROUTER MOUNTED')
console.log('RISK ROUTER MOUNTED')

app.use((request, response) => {
  response.status(404).json({
    success: false,
    message: 'API route not found',
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TerraWatch API is running on http://localhost:${PORT}`)
})