
import { Router } from 'express'

import {
  createReport,
  getReports,
  getMyReports,
  getReportById,
  updateReportStatus,
  assignReportOfficer,
  deleteReport,
} from '../controllers/reportsController.js'

import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js'

const router = Router()

// All report routes require authentication
router.use(authenticateToken)

// Citizen: View only their own reports
router.get(
  '/my-reports',
  authorizeRoles('citizen'),
  getMyReports
)

// Admin and Officer: View all reports
router.get(
  '/',
  authorizeRoles('admin', 'officer'),
  getReports
)
// Admin and Officer: View a single report
router.get(
  '/:id',
  authorizeRoles('admin', 'officer'),
  getReportById
)

// Admin, Officer and Citizen: Submit reports
router.post(
  '/',
  authorizeRoles('admin', 'officer', 'citizen'),
  createReport
)

// Admin and Officer: Update report status
router.patch(
  '/:id/status',
  authorizeRoles('admin', 'officer'),
  updateReportStatus
)

// Only Admin: Assign or reassign an officer
router.patch(
  '/:id/assign',
  authorizeRoles('admin'),
  assignReportOfficer
)

// Only Admin: Delete reports
router.delete(
  '/:id',
  authorizeRoles('admin'),
  deleteReport
)

export default router
