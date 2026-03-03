import { Appointment } from '../models/Appointment';

export interface IAppointmentRepository {
    create(
        customerId: string,
        providerId: string,
        serviceId: string,
        appointmentDate: string,
        startTime: string,
        endTime: string,
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
        startTime: string,
        endTime: string
    ): Promise<Appointment[]>;

    // Durum güncelle
    updateStatus(id: string, status: string): Promise<Appointment | null>;
}