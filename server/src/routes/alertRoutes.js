
import { Router } from 'express'

import {
  getAlerts,
  createAlert,
  updateAlertStatus,
  deleteAlert,
} from '../controllers/alertsController.js'

const router = Router()

router.get('/', getAlerts)
router.post('/', createAlert)
router.patch('/:id/status', updateAlertStatus)
router.delete('/:id', deleteAlert)

export default router
