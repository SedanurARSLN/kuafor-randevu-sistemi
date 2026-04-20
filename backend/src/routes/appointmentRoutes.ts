import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { AppointmentService } from '../services/AppointmentService';
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { ServiceRepository } from '../repositories/ServiceRepository';
import { UserRepository } from '../repositories/UserRepository';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createAppointmentValidator, createPublicAppointmentValidator } from '../validators/appointmentValidator';
import { publicAppointmentLimiter } from '../middlewares/rateLimiter';

const router = Router();

// ─── Dependency Injection
const appointmentRepository = new AppointmentRepository();
const serviceRepository = new ServiceRepository();
const userRepository = new UserRepository();
const appointmentService = new AppointmentService(appointmentRepository, serviceRepository, userRepository);
const appointmentController = new AppointmentController(appointmentService);

// ─── ROUTES
router.post('/public', publicAppointmentLimiter, createPublicAppointmentValidator, validateRequest, appointmentController.publicCreate);

// Kuaför ve tarih bazında randevuları getir (public erişim - web formu için auth yok)
router.get(
    '/provider/:providerId/date/:date',
    appointmentController.getProviderAppointmentsByDate
);

// Müşteri: Randevu al
router.post(
    '/',
    authenticate,
    authorize('customer'),
    createAppointmentValidator,
    validateRequest,
    appointmentController.create
);

// Kuaför: Kazanç istatistikleri
router.get(
    '/earnings',
    authenticate,
    authorize('provider'),
    appointmentController.getEarnings
);

// Herkes: Kendi randevularını gör
router.get(
    '/my',
    authenticate,
    appointmentController.getMyAppointments
);

// Herkes: Randevu detayı
router.get(
    '/:id',
    authenticate,
    appointmentController.getById
);

// Kuaför: Randevu onayla
router.patch(
    '/:id/confirm',
    authenticate,
    authorize('provider'),
    appointmentController.confirm
);

// Herkes: Randevu iptal
router.patch(
    '/:id/cancel',
    authenticate,
    appointmentController.cancel
);

// Kuaför: Randevu tamamla
router.patch(
    '/:id/complete',
    authenticate,
    authorize('provider'),
    appointmentController.complete
);

export default router;