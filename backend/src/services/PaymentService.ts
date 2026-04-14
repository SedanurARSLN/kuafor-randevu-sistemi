import Stripe from 'stripe';
import { config } from '../config/environment';
import { IAppointmentRepository } from '../interfaces/IAppointmentRepository';
import { AppError } from '../utils/AppError';

export class PaymentService {
    private stripe: InstanceType<typeof Stripe> | null;
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
        this.stripe = config.stripeSecretKey
            ? new Stripe(config.stripeSecretKey)
            : null;
    }

    async createPaymentIntent(appointmentId: string, userId: string): Promise<{ clientSecret: string; paymentIntentId: string }> {
        if (!this.stripe) {
            throw new AppError('Ödeme sistemi yapılandırılmamış', 503);
        }

        const appointment = await this.appointmentRepository.findById(appointmentId);
        if (!appointment) {
            throw new AppError('Randevu bulunamadı', 404);
        }
        if (appointment.customer_id !== userId) {
            throw new AppError('Bu randevu için ödeme yapma yetkiniz yok', 403);
        }
        if (appointment.payment_status === 'paid') {
            throw new AppError('Bu randevu zaten ödenmiş', 400);
        }

        const amount = Math.round(Number(appointment.total_price) * 100);

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount,
            currency: 'try',
            metadata: {
                appointment_id: appointmentId,
                customer_id: userId,
            },
        });

        await this.appointmentRepository.updatePaymentStatus(
            appointmentId,
            'pending',
            paymentIntent.id
        );

        return {
            clientSecret: paymentIntent.client_secret!,
            paymentIntentId: paymentIntent.id,
        };
    }

    async handleWebhook(payload: Buffer, signature: string): Promise<void> {
        if (!this.stripe) return;

        let event: any;
        try {
            event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                config.stripeWebhookSecret
            );
        } catch {
            throw new AppError('Webhook imza doğrulaması başarısız', 400);
        }

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const appointmentId = paymentIntent.metadata?.appointment_id;
            if (appointmentId) {
                await this.appointmentRepository.updatePaymentStatus(appointmentId, 'paid', paymentIntent.id);
            }
        }

        if (event.type === 'charge.refunded') {
            const charge = event.data.object;
            const paymentIntentId = charge.payment_intent as string;
            if (paymentIntentId) {
                // Refund handled via metadata
            }
        }
    }

    async refundPayment(appointmentId: string): Promise<void> {
        if (!this.stripe) return;

        const appointment = await this.appointmentRepository.findById(appointmentId);
        if (!appointment || !appointment.stripe_payment_intent_id) return;
        if (appointment.payment_status !== 'paid') return;

        await this.stripe.refunds.create({
            payment_intent: appointment.stripe_payment_intent_id,
        });

        await this.appointmentRepository.updatePaymentStatus(appointmentId, 'refunded');
    }

    async confirmPayment(appointmentId: string, userId: string): Promise<{ status: string }> {
        const appointment = await this.appointmentRepository.findById(appointmentId);
        if (!appointment) {
            throw new AppError('Randevu bulunamadı', 404);
        }
        if (appointment.customer_id !== userId) {
            throw new AppError('Yetkiniz yok', 403);
        }

        if (!this.stripe || !appointment.stripe_payment_intent_id) {
            await this.appointmentRepository.updatePaymentStatus(appointmentId, 'paid');
            return { status: 'paid' };
        }

        const pi = await this.stripe.paymentIntents.retrieve(appointment.stripe_payment_intent_id);
        if (pi.status === 'succeeded') {
            await this.appointmentRepository.updatePaymentStatus(appointmentId, 'paid', pi.id);
            return { status: 'paid' };
        }

        return { status: pi.status };
    }
}
