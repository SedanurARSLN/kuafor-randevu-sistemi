import { IAppointmentRepository } from '../interfaces/IAppointmentRepository';
import { IServiceRepository } from '../interfaces/IServiceRepository';
import { CreateAppointmentDTO, AppointmentResponse } from '../models/Appointment';
import { AppError } from '../utils/AppError';
import { Service } from '../models/Service';

export class AppointmentService {
    private appointmentRepository: IAppointmentRepository;
    private serviceRepository: IServiceRepository;

    constructor(
        appointmentRepository: IAppointmentRepository,
        serviceRepository: IServiceRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.serviceRepository = serviceRepository;
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
        for (const s of services) {
            if (!s) {
                throw new AppError('Seçilen hizmetlerden biri bulunamadı', 404);
            }
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
        // Toplam fiyat: Gönderilmediyse seçilen hizmetlerden hesapla
        const totalPrice =
            dto.total_price != null && !Number.isNaN(Number(dto.total_price))
                ? Number(dto.total_price)
                : services.reduce((sum, s) => sum + Number(s.price), 0);
        // Çakışma kontrolü (sadece başlangıç saati ile)
        const conflicts = await this.appointmentRepository.findConflicting(
            dto.provider_id,
            dto.appointment_date,
            dto.start_time
        );
        if (conflicts.length > 0) {
            throw new AppError('Bu saatte zaten bir randevu var', 409);
        }
        // Randevu oluştur
        const appointment = await this.appointmentRepository.create(
            customerId,
            dto.provider_id,
            incomingServiceIds.join(','), // Çoklu hizmet için string olarak kaydedilecek
            dto.appointment_date,
            dto.start_time,
            totalPrice,
            dto.notes
        );
        const detailed = await this.appointmentRepository.findById(appointment.id);
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
        return this.appointmentRepository.findById(id);
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
        return this.appointmentRepository.findById(id);
    }

    // ─── RANDEVU TAMAMLA (kuaför)
    async completeAppointment(id: string, providerId: string): Promise<AppointmentResponse> {
        const appointment = await this.appointmentRepository.findById(id);
        if (!appointment) throw new AppError('Randevu bulunamadı', 404);
        if (appointment.provider_id !== providerId) throw new AppError('Yetkiniz yok', 403);
        if (appointment.status !== 'confirmed') throw new AppError('Sadece onaylı randevular tamamlanabilir', 400);

        await this.appointmentRepository.updateStatus(id, 'completed');
        return this.appointmentRepository.findById(id);
    }

    // Bitiş saati fonksiyonu kaldırıldı
}