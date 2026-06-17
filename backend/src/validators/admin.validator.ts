import { body } from 'express-validator'

export const addUserValidator = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address'),

  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage('Password must contain at least one special character'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters'),

  body('role')
    .isIn(['USER', 'ADMIN', 'STORE_OWNER'])
    .withMessage('Role must be one of: USER, ADMIN, STORE_OWNER'),
]

export const addStoreValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Store name is required'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address'),

  body('address')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters'),

  body('owner_id')
    .optional({ nullable: true })
    .custom((value: unknown) => {
      if (value === '' || value === null || value === undefined) return true
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value))
    })
    .withMessage('Owner ID must be a valid UUID or empty'),
]

export const updateUserValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address'),

  body('address')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters'),

  body('role')
    .optional()
    .isIn(['USER', 'ADMIN', 'STORE_OWNER'])
    .withMessage('Role must be one of: USER, ADMIN, STORE_OWNER'),
]

export const updateStoreValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Store name cannot be empty'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address'),

  body('address')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters'),

  body('owner_id')
    .optional({ nullable: true })
    .custom((value: unknown) => {
      if (value === '' || value === null || value === undefined) return true
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value))
    })
    .withMessage('Owner ID must be a valid UUID or empty'),
]
