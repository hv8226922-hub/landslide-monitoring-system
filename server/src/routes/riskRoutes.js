
import { Router } from 'express'

import {
  getRiskPredictions,
  createRiskPrediction,
  deleteRiskPrediction,
} from '../controllers/riskController.js'

import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js'

const router = Router()

// Anyone authenticated can view risk records
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'officer', 'citizen'),
  getRiskPredictions
)

// Only admin can add risk records
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  createRiskPrediction
)

// Only admin can delete risk records
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  deleteRiskPrediction
)

export default router
