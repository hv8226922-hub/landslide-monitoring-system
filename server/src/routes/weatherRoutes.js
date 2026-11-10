
import { Router } from 'express'

import {
  getWeatherRecords,
  createWeatherRecord,
  deleteWeatherRecord,
} from '../controllers/weatherController.js'

const router = Router()

// Get all weather records
router.get('/', getWeatherRecords)

// Create weather record
router.post('/', createWeatherRecord)

// Delete weather record
router.delete('/:id', deleteWeatherRecord)

export default router
