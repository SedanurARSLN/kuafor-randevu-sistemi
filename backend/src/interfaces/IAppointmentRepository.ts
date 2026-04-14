import { Appointment } from '../models/Appointment';

export interface IAppointmentRepository {
    create(
        customerId: string,
        providerId: string,
        serviceIds: string,
        appointmentDate: string,
        startTime: string,
        endTime: string,
        totalPrice: number,
        notes?: string
    ): Promise<Appointment>;

    findById(id: string): Promise<any | null>;

    findByCustomerId(customerId: string): Promise<any[]>;

    findByProviderId(providerId: string): Promise<any[]>;

    findConflicting(
        providerId: string,
        appointmentDate: string,
        startTime: string,
        endTime: string
    ): Promise<Appointment[]>;

    findByProviderAndDate(providerId: string, date: string): Promise<any[]>;

    getProviderEarnings(providerId: string): Promise<{
        daily: { total: number; count: number };
        weekly: { total: number; count: number };
        monthly: { total: number; count: number };
    }>;

    updateStatus(id: string, status: string): Promise<Appointment | null>;

    updatePaymentStatus(id: string, paymentStatus: string, stripePaymentIntentId?: string): Promise<Appointment | null>;
}
