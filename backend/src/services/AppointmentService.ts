import { IAppointmentRepository } from '../interfaces/IAppointmentRepository';
import { IServiceRepository } from '../interfaces/IServiceRepository';
import { IUserRepository } from '../interfaces/IUserRepository';
import { CreateAppointmentDTO, AppointmentResponse } from '../models/Appointment';
import { AppError } from '../utils/AppError';
import { Service } from '../models/Service';
import { notificationService, NotificationTemplates } from './NotificationService';

export class AppointmentService {
    private appointmentRepository: IAppointmentRepository;
    private serviceRepository: IServiceRepository;
    private userRepository?: IUserRepository;

    constructor(
        appointmentRepository: IAppointmentRepository,
        serviceRepository: IServiceRepository,
        userRepository?: IUserRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
    }

    // ─── Yardımcı: userId → push token (null-safe)
    private async getToken(userId: string): Promise<string | null> {
        if (!this.userRepository) return null;
        return this.userRepository.getPushToken(userId);
    }

    // ─── RANDEVU AL
    async createAppointment(customerId: string, dto: CreateAppointmentDTO): Promise<AppointmentResponse> {
        // service_ids (yeni) yoksa, eski tekli service_id alanından diziyi oluştur
        const incomingServiceIds: string[] =
            Array.isArray((dto as any).service_ids) && (dto as any).service_ids.length > 0
                ? (dto as any).service_ids
                : (dto as any).service_id
                ? [(dto as any).service_id]
                : [];

        // 1. Hizmetleri kontrol et
        const services = await Promise.all(incomingServiceIds.map(id => this.serviceRepository.findById(id)));
        const validServices: Service[] = services.filter((s): s is Service => !!s);

        if (validServices.length !== incomingServiceIds.length) {
            throw new AppError('Seçilen hizmetlerden biri bulunamadı', 404);
        }

        for (const s of validServices) {
            if (!s.is_active) {
                throw new AppError('Seçilen hizmetlerden biri aktif değil', 400);
            }
            if (s.provider_id !== dto.provider_id) {
                throw new AppError('Seçilen hizmetlerden biri bu kuaföre ait değil', 400);
            }
        }
        if (customerId === dto.provider_id) {
            throw new AppError('Kendinize randevu alamazsınız', 400);
        }
        const appointmentDate = new Date(dto.appointment_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (appointmentDate < today) {
            throw new AppError('Geçmiş tarihe randevu alınamaz', 400);
        }

        // Fiyatı her zaman sunucu tarafında hesapla (istemci değerini yoksay)
        let totalPrice = 0;
        let totalDuration = 0;
        for (const svc of validServices) {
            totalPrice += Number(svc.price);
            totalDuration += Number((svc as any).duration_minutes ?? (svc as any).duration_min ?? 30);
        }

        // end_time hesapla
        const [startH, startM] = dto.start_time.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = startMinutes + totalDuration;
        const endH = Math.floor(endMinutes / 60);
        const endM = endMinutes % 60;
        const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

        // Zaman aralığı bazlı çakışma kontrolü
        const conflicts = await this.appointmentRepository.findConflicting(
            dto.provider_id,
            dto.appointment_date,
            dto.start_time,
            endTime
        );
        if (conflicts.length > 0) {
            throw new AppError('Bu saatte zaten bir randevu var', 409);
        }

        const appointment = await this.appointmentRepository.create(
            customerId,
            dto.provider_id,
            incomingServiceIds,
            dto.appointment_date,
            dto.start_time,
            endTime,
            totalPrice,
            dto.notes
        );
        const detailed = await this.appointmentRepository.findById(appointment.id);

        // 🔔 Kuaföre: yeni randevu bildirimi
        try {
            const providerToken = await this.getToken(dto.provider_id);
            const customerName = detailed?.customer_name ?? 'Müşteri';
            const dateStr = new Date(dto.appointment_date).toLocaleDateString('tr-TR', {
                day: 'numeric', month: 'long',
            });
            const tpl = NotificationTemplates.newAppointment(customerName, dateStr, dto.start_time.slice(0, 5));
            await notificationService.send(providerToken, tpl.title, tpl.body, {
                screen: 'Appointments', appointmentId: appointment.id,
            });
        } catch { /* bildirim hatası randevu oluşturmayı engellemez */ }

        return detailed;
    }

    // ─── MÜŞTERİNİN RANDEVULARI
    async getCustomerAppointments(customerId: string): Promise<AppointmentResponse[]> {
        return this.appointmentRepository.findByCustomerId(customerId);
    }

    // ─── KUAFÖRÜN RANDEVULARI
    async getProviderAppointments(providerId: string): Promise<AppointmentResponse[]> {
        return this.appointmentRepository.findByProviderId(providerId);
    }

    // ─── RANDEVU DETAYI
    async getAppointmentById(id: string, userId: string): Promise<AppointmentResponse> {
        const appointment = await this.appointmentRepository.findById(id);
        if (!appointment) {
            throw new AppError('Randevu bulunamadı', 404);
        }

        // Sadece kendi randevusunu görebilir
        if (appointment.customer_id !== userId && appointment.provider_id !== userId) {
            throw new AppError('Bu randevuyu görüntüleme yetkiniz yok', 403);
        }

        return appointment;
    }

        // ─── BELİRLİ KUAFÖR VE TARİHTEKİ RANDEVULAR
        async getProviderAppointmentsByDate(providerId: string, date: string): Promise<AppointmentResponse[]> {
            return this.appointmentRepository.findByProviderAndDate(providerId, date);
        }
    // ─── RANDEVU ONAYLA (kuaför)
    async confirmAppointment(id: string, providerId: string): Promise<AppointmentResponse> {
        const appointment = await this.appointmentRepository.findById(id);
        if (!appointment) throw new AppError('Randevu bulunamadı', 404);
        if (appointment.provider_id !== providerId) throw new AppError('Yetkiniz yok', 403);
        if (appointment.status !== 'pending') throw new AppError('Sadece bekleyen randevular onaylanabilir', 400);

        await this.appointmentRepository.updateStatus(id, 'confirmed');
        const confirmed = await this.appointmentRepository.findById(id);

        // 🔔 Müşteriye: randevu onaylandı bildirimi
        try {
            const customerToken = await this.getToken(appointment.customer_id);
            const dateStr = new Date(appointment.appointment_date).toLocaleDateString('tr-TR', {
                day: 'numeric', month: 'long',
            });
            const tpl = NotificationTemplates.appointmentConfirmed(
                confirmed?.provider_name ?? 'Kuaförunüz',
                dateStr,
                String(appointment.start_time).slice(0, 5)
            );
            await notificationService.send(customerToken, tpl.title, tpl.body, {
                screen: 'Appointments', appointmentId: id,
            });
        } catch { /* silent */ }

        return confirmed;
    }

    // ─── RANDEVU İPTAL
    async cancelAppointment(id: string, userId: string): Promise<AppointmentResponse> {
        const appointment = await this.appointmentRepository.findById(id);
        if (!appointment) throw new AppError('Randevu bulunamadı', 404);

        if (appointment.customer_id !== userId && appointment.provider_id !== userId) {
            throw new AppError('Yetkiniz yok', 403);
        }

        if (appointment.status === 'cancelled') throw new AppError('Randevu zaten iptal edilmiş', 400);
        if (appointment.status === 'completed') throw new AppError('Tamamlanan randevu iptal edilemez', 400);

        await this.appointmentRepository.updateStatus(id, 'cancelled');
        const cancelled = await this.appointmentRepository.findById(id);

        // 🔔 Karşı tarafa: iptal bildirimi
        try {
            const dateStr = new Date(appointment.appointment_date).toLocaleDateString('tr-TR', {
                day: 'numeric', month: 'long',
            });
            const timeStr = String(appointment.start_time).slice(0, 5);

            // Kim iptal etti? Karşı tarafa bildir
            if (userId === appointment.customer_id) {
                // Müşteri iptal etti → kuaföre bildir
                const providerToken = await this.getToken(appointment.provider_id);
                const tpl = NotificationTemplates.appointmentCancelled(
                    cancelled?.customer_name ?? 'Müşteri', dateStr, timeStr
                );
                await notificationService.send(providerToken, tpl.title, tpl.body, {
                    screen: 'Appointments', appointmentId: id,
                });
            } else {
                // Kuaför iptal etti → müşteriye bildir
                const customerToken = await this.getToken(appointment.customer_id);
                const tpl = NotificationTemplates.appointmentCancelled(
                    cancelled?.provider_name ?? 'Kuaförunüz', dateStr, timeStr
                );
                await notificationService.send(customerToken, tpl.title, tpl.body, {
                    screen: 'Appointments', appointmentId: id,
                });
            }
        } catch { /* silent */ }

        return cancelled;
    }

    // ─── RANDEVU TAMAMLA (kuaför)
    async completeAppointment(id: string, providerId: string): Promise<AppointmentResponse> {
        const appointment = await this.appointmentRepository.findById(id);
        if (!appointment) throw new AppError('Randevu bulunamadı', 404);
        if (appointment.provider_id !== providerId) throw new AppError('Yetkiniz yok', 403);
        if (appointment.status !== 'confirmed') throw new AppError('Sadece onaylı randevular tamamlanabilir', 400);

        await this.appointmentRepository.updateStatus(id, 'completed');
        const completed = await this.appointmentRepository.findById(id);

        // 🔔 Müşteriye: randevu tamamlandı bildirimi
        try {
            const customerToken = await this.getToken(appointment.customer_id);
            const tpl = NotificationTemplates.appointmentCompleted(
                completed?.provider_name ?? 'Kuaförunüz'
            );
            await notificationService.send(customerToken, tpl.title, tpl.body, {
                screen: 'Appointments', appointmentId: id,
            });
        } catch { /* silent */ }

        return completed;
    }

    // ─── KUAFÖR KAZANÇ İSTATİSTİKLERİ
    async getProviderEarnings(providerId: string) {
        return this.appointmentRepository.getProviderEarnings(providerId);
    }
}