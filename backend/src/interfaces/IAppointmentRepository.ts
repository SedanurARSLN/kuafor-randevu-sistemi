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
    // Durum güncelle
    updateStatus(id: string, status: string): Promise<Appointment | null>;
}