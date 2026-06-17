import { Router } from 'express'
import {
  getDashboard,
  addUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  addStore,
  getStores,
  updateStore,
  deleteStore,
} from '../controllers/admin.controller'
import { addUserValidator, updateUserValidator, addStoreValidator, updateStoreValidator } from '../validators/admin.validator'
import { authMiddleware } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'

const router = Router()

router.use(authMiddleware, requireRole('ADMIN'))

router.get('/dashboard', getDashboard)
router.post('/users', addUserValidator, addUser)
router.get('/users', getUsers)
router.get('/users/:id', getUserById)
router.patch('/users/:id', updateUserValidator, updateUser)
router.delete('/users/:id', deleteUser)
router.post('/stores', addStoreValidator, addStore)
router.get('/stores', getStores)
router.patch('/stores/:id', updateStoreValidator, updateStore)
router.delete('/stores/:id', deleteStore)

export default router
