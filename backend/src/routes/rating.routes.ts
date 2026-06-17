import { Router } from 'express'
import { body } from 'express-validator'
import { submitRating, updateRating } from '../controllers/rating.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'

const ratingValueValidator = body('value')
  .isInt({ min: 1, max: 5 })
  .withMessage('Rating must be an integer between 1 and 5')

const router = Router()

router.use(authMiddleware, requireRole('USER'))

router.post(
  '/',
  [
    body('store_id').isUUID().withMessage('store_id must be a valid UUID'),
    ratingValueValidator,
  ],
  submitRating
)

router.patch(
  '/:id',
  [ratingValueValidator],
  updateRating
)

export default router
