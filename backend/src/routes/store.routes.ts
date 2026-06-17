import { Router } from 'express'
import { getStores } from '../controllers/store.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'

const router = Router()

router.use(authMiddleware, requireRole('USER'))

router.get('/', getStores)

export default router
