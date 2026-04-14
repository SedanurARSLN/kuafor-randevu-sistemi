import { Router, raw } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { PaymentService } from '../services/PaymentService';
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

const appointmentRepository = new AppointmentRepository();
const paymentService = new PaymentService(appointmentRepository);
const paymentController = new PaymentController(paymentService);

router.post('/create-intent', authenticate, paymentController.createIntent);
router.post('/confirm', authenticate, paymentController.confirmPayment);
router.post('/webhook', raw({ type: 'application/json' }), paymentController.webhook);

export default router;
