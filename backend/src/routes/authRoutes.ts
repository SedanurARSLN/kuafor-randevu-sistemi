import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import { authenticate } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
    registerCustomerValidator,
    registerProviderValidator,
    loginValidator,
} from '../validators/authValidator';

const router = Router();

// ─── Dependency Injection (SOLID: D prensibi)
// Repository → Service → Controller sırasıyla enjekte ediliyor
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

// ─── ROUTES

// Müşteri kayıt
router.post(
    '/register/customer',
    registerCustomerValidator,
    validateRequest,
    authController.registerCustomer
);

// Kuaför kayıt
router.post(
    '/register/provider',
    registerProviderValidator,
    validateRequest,
    authController.registerProvider
);

// Giriş
router.post(
    '/login',
    loginValidator,
    validateRequest,
    authController.login
);

// Profil görüntüle (token gerekli)
router.get(
    '/profile',
    authenticate,
    authController.getProfile
);

export default router;