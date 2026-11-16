
import { Router } from 'express'

import {
  getWeatherRecords,
  createWeatherRecord,
  deleteWeatherRecord,
} from '../controllers/weatherController.js'

import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js'

const router = Router()

// Get weather records - authenticated users
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'officer', 'citizen'),
  getWeatherRecords
)

// Create weather record - Admin only
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  createWeatherRecord
)

// Delete weather record - Admin only
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  deleteWeatherRecord
)

export default router

