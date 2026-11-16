import { Router } from 'express'

import {
  getSettings,
  updateSettings,
} from '../controllers/settingsController.js'

import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js'

const router = Router()

router.use(authenticateToken)
router.use(authorizeRoles('admin'))

router.get('/', getSettings)
router.put('/', updateSettings)

export default router