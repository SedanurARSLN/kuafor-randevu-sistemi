import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/AppointmentService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { UserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcrypt';

const userRepository = new UserRepository();

export class AppointmentController {
    private appointmentService: AppointmentService;

    constructor(appointmentService: AppointmentService) {
        this.appointmentService = appointmentService;
    }

    // POST /api/appointments — Randevu al (müşteri)
    create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const customerId = req.user!.userId;
            const result = await this.appointmentService.createAppointment(customerId, req.body);
            res.status(201).json({
                success: true,
                message: 'Randevu başarıyla oluşturuldu',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // POST /api/appointments/public — Misafir randevu (giriş yok)
    publicCreate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            console.log('📥 PUBLIC APPOINTMENT REQUEST BODY:', req.body);

            const { full_name, phone, ...appointmentData } = req.body;

            const safeName = (full_name && String(full_name).trim()) || 'Misafir Müşteri';
            const phoneDigits = phone ? String(phone).replace(/\D/g, '') : '';

            // Aynı telefonla daha önce oluşturulmuş müşteri varsa onu kullan (telefon geldiyse)
            let customer = phoneDigits ? await userRepository.findByPhone(phoneDigits) : null;

            // Yoksa misafir müşteri oluştur
            if (!customer) {
                const randomPassword = Math.random().toString(36).slice(-8);
                const passwordHash = await bcrypt.hash(randomPassword, 12);
                const email = phoneDigits
                    ? `guest-${phoneDigits}@guest.local`
                    : `guest-${Date.now()}@guest.local`;

                customer = await userRepository.create(
                    safeName,
                    email,
                    passwordHash,
                    phoneDigits || undefined,
                    'customer'
                );
            }

            const result = await this.appointmentService.createAppointment(customer.id, appointmentData as any);

            res.status(201).json({
                success: true,
                message: 'Randevu başarıyla oluşturuldu',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/appointments/my — Müşterinin randevuları
    getMyAppointments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const role = req.user!.role;

            let result;
            if (role === 'provider') {
                result = await this.appointmentService.getProviderAppointments(userId);
            } else {
                result = await this.appointmentService.getCustomerAppointments(userId);
            }

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/appointments/:id — Randevu detayı
    getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const userId = req.user!.userId;
            const result = await this.appointmentService.getAppointmentById(id, userId);
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/appointments/provider/:providerId/date/:date — Belirli kuaför ve tarihteki randevular
    getProviderAppointmentsByDate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const providerId = req.params.providerId as string;
            const date = req.params.date as string;
            const appointments = await this.appointmentService.getProviderAppointmentsByDate(providerId, date);
            res.status(200).json({
                success: true,
                data: appointments,
            });
        } catch (error) {
            next(error);
        }
    };
    // PATCH /api/appointments/:id/confirm — Onayla (kuaför)
    confirm = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const providerId = req.user!.userId;
            const result = await this.appointmentService.confirmAppointment(id, providerId);
            res.status(200).json({
                success: true,
                message: 'Randevu onaylandı',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // PATCH /api/appointments/:id/cancel — İptal
    cancel = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const userId = req.user!.userId;
            const result = await this.appointmentService.cancelAppointment(id, userId);
            res.status(200).json({
                success: true,
                message: 'Randevu iptal edildi',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/appointments/earnings — Kuaför kazanç istatistikleri
    getEarnings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const providerId = req.user!.userId;
            const result = await this.appointmentService.getProviderEarnings(providerId);
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // PATCH /api/appointments/:id/complete — Tamamla (kuaför)
    complete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const providerId = req.user!.userId;
            const result = await this.appointmentService.completeAppointment(id, providerId);
            res.status(200).json({
                success: true,
                message: 'Randevu tamamlandı',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };
}