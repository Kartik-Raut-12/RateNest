import { Router } from 'express'
import { getOwnerDashboard } from '../controllers/owner.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'

const router = Router()

router.use(authMiddleware, requireRole('STORE_OWNER'))

router.get('/dashboard', getOwnerDashboard)

export default router
