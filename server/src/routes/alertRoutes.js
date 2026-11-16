
import { Router } from 'express'

import {
  getAlerts,
  createAlert,
  updateAlertStatus,
  deleteAlert,
} from '../controllers/alertsController.js'

import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js'

const router = Router()

// All alert routes require authentication
router.use(authenticateToken)

// Admin, Officer and Citizen can view alerts
router.get(
  '/',
  authorizeRoles('admin', 'officer', 'citizen'),
  getAlerts
)

// Only Admin can create alerts
router.post(
  '/',
  authorizeRoles('admin'),
  createAlert
)

// Admin and Officer can update alert status
router.patch(
  '/:id/status',
  authorizeRoles('admin', 'officer'),
  updateAlertStatus
)

// Only Admin can delete alerts
router.delete(
  '/:id',
  authorizeRoles('admin'),
  deleteAlert
)

export default router

