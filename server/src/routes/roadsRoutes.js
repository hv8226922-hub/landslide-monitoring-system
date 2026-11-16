
import { Router } from 'express'

import {
  getRoads,
  createRoad,
  updateRoad,
  deleteRoad,
} from '../controllers/roadsController.js'

import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js'

const router = Router()

// All road routes require Admin authentication
router.use(authenticateToken)
router.use(authorizeRoles('admin'))

// Get all roads
router.get('/', getRoads)

// Add a road
router.post('/', createRoad)

// Update a road
router.put('/:id', updateRoad)

// Delete a road
router.delete('/:id', deleteRoad)

export default router
