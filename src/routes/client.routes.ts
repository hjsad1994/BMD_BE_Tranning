import { Router } from 'express'
import { ClientController } from '../tsoa-controllers/ClientController.js'
import { authenticateClient } from '../middleware/client.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { UpdateProfileSchema, ChangePasswordSchema } from '../validators/client.validator.js'

const router = Router()
const clientController = new ClientController()

// GET /api/client/profile — get my profile
router.get(
    '/profile',
    authenticateClient,
    clientController.getProfileHandler.bind(clientController)
)

// PUT /api/client/profile — update my profile
router.put(
    '/profile',
    authenticateClient,
    validate(UpdateProfileSchema),
    clientController.updateProfileHandler.bind(clientController)
)

// PUT /api/client/change-password — change my password
router.put(
    '/change-password',
    authenticateClient,
    validate(ChangePasswordSchema),
    clientController.changePasswordHandler.bind(clientController)
)

// DELETE /api/client/account — soft-delete my account
router.delete(
    '/account',
    authenticateClient,
    clientController.deleteAccountHandler.bind(clientController)
)

export default router
