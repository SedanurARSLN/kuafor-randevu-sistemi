import { Appointment } from '../models/Appointment';

export interface IAppointmentRepository {
    create(
        customerId: string,
        providerId: string,
        serviceIds: string,
        appointmentDate: string,
        startTime: string,
        totalPrice: number,
        notes?: string
    ): Promise<Appointment>;

    findById(id: string): Promise<any | null>;

    // Müşterinin randevuları
    findByCustomerId(customerId: string): Promise<any[]>;

    // Kuaförün randevuları
    findByProviderId(providerId: string): Promise<any[]>;

    // Çakışma kontrolü
    findConflicting(
        providerId: string,
        appointmentDate: string,
        startTime: string
    ): Promise<Appointment[]>;

        // Belirli kuaför ve tarihteki randevular
        findByProviderAndDate(providerId: string, date: string): Promise<any[]>;
    // Kuaförün kazanç istatistikleri
    getProviderEarnings(providerId: string): Promise<{
        daily: { total: number; count: number };
        weekly: { total: number; count: number };
        monthly: { total: number; count: number };
    }>;

    // Durum güncelle
    updateStatus(id: string, status: string): Promise<Appointment | null>;
}