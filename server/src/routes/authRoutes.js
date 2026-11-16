
import express from 'express'

import {
  register,
  login,
  getOfficers,
} from '../controllers/authController.js'

import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)

// Only Admin can view officers
router.get(
  '/officers',
  authenticateToken,
  authorizeRoles('admin'),
  getOfficers
)

export default router

