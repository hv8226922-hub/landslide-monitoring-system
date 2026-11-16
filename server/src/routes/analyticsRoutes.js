
import { Router } from 'express'

import { getAnalytics } from '../controllers/analyticsController.js'

import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js'

const router = Router()

router.use(authenticateToken)
router.use(authorizeRoles('admin'))

router.get('/', getAnalytics)

export default router
