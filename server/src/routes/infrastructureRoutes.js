import { Router } from 'express'

import {
  getInfrastructure,
  createInfrastructure,
  updateInfrastructure,
  deleteInfrastructure,
} from '../controllers/infrastructureController.js'

import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js'

const router = Router()

router.use(authenticateToken)
router.use(authorizeRoles('admin'))

router.get('/', getInfrastructure)
router.post('/', createInfrastructure)
router.put('/:id', updateInfrastructure)
router.delete('/:id', deleteInfrastructure)

export default router