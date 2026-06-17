import { Router } from 'express'
import { register, login, changePassword } from '../controllers/auth.controller'
import { registerValidator, loginValidator, changePasswordValidator } from '../validators/auth.validator'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.post('/register', registerValidator, register)
router.post('/login', loginValidator, login)
router.patch('/change-password', authMiddleware, changePasswordValidator, changePassword)

export default router
