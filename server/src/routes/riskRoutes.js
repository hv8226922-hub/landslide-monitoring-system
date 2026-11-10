
import { Router } from 'express'

import {
  getRiskPredictions,
  createRiskPrediction,
} from '../controllers/riskController.js'

const router = Router()

// Get all risk predictions
router.get('/', getRiskPredictions)

// Create risk prediction record
router.post('/', createRiskPrediction)

export default router
