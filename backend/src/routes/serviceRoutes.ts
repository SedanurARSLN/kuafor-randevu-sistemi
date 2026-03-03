import { Router } from 'express';
import { ServiceController } from '../controllers/ServiceController';
import { ServiceService } from '../services/ServiceService';
import { ServiceRepository } from '../repositories/ServiceRepository';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createServiceValidator, updateServiceValidator } from '../validators/serviceValidator';

const router = Router();

// ─── Dependency Injection (SOLID: D prensibi)
const serviceRepository = new ServiceRepository();
const serviceService = new ServiceService(serviceRepository);
const serviceController = new ServiceController(serviceService);

// ─── ROUTES

// Kuaför: Hizmet ekle (sadece provider!)
router.post(
    '/',
    authenticate,
    authorize('provider'),
    createServiceValidator,
    validateRequest,
    serviceController.create
);

// Kuaför: Kendi hizmetlerini gör
router.get(
    '/my',
    authenticate,
    authorize('provider'),
    serviceController.getMyServices
);

// Herkes: Bir kuaförün hizmetlerini gör (müşteri randevu alırken)
router.get(
    '/provider/:providerId',
    serviceController.getProviderServices
);

// Herkes: Tek hizmet detayı
router.get(
    '/:id',
    serviceController.getById
);

// Kuaför: Hizmet güncelle
router.put(
    '/:id',
    authenticate,
    authorize('provider'),
    updateServiceValidator,
    validateRequest,
    serviceController.update
);

// Kuaför: Hizmet sil
router.delete(
    '/:id',
    authenticate,
    authorize('provider'),
    serviceController.delete
);

export default router;