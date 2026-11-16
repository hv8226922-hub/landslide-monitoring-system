
import { Router } from 'express'

import {
  getVillages,
  createVillage,
  updateVillage,
  deleteVillage,
} from '../controllers/villagesController.js'

import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js'

const router = Router()

// All village routes require Admin authentication
router.use(authenticateToken)
router.use(authorizeRoles('admin'))

// Get all villages
router.get('/', getVillages)

// Add a village
router.post('/', createVillage)

// Update a village
router.put('/:id', updateVillage)

// Delete a village
router.delete('/:id', deleteVillage)

export default router
