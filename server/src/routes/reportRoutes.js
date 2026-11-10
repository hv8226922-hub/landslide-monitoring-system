
import { Router } from 'express'

import {
  createReport,
  getReports,
  updateReportStatus,
  deleteReport,
} from '../controllers/reportsController.js'

const router = Router()

// Get all reports
router.get('/', getReports)

// Create new report
router.post('/', createReport)

// Update report status
router.patch('/:id/status', updateReportStatus)

// Delete report from database
router.delete('/:id', deleteReport)

export default router
