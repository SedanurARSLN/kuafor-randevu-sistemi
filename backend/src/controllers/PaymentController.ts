import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/PaymentService';
import { AuthRequest } from '../middlewares/authMiddleware';

export class PaymentController {
    private paymentService: PaymentService;

    constructor(paymentService: PaymentService) {
        this.paymentService = paymentService;
    }

    createIntent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const { appointment_id } = req.body;
            const result = await this.paymentService.createPaymentIntent(appointment_id, userId);
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    confirmPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const { appointment_id } = req.body;
            const result = await this.paymentService.confirmPayment(appointment_id, userId);
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    webhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const signature = req.headers['stripe-signature'] as string;
            await this.paymentService.handleWebhook(req.body, signature);
            res.status(200).json({ received: true });
        } catch (error) {
            next(error);
        }
    };
}
