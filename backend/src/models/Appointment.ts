export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
    id: string;
    customer_id: string;
    provider_id: string;
    appointment_date: Date;
    start_time: string;
    end_time: string;
    status: AppointmentStatus;
    notes?: string;
    total_price: number;
    payment_status: PaymentStatus;
    stripe_payment_intent_id?: string;
    created_at: Date;
    updated_at: Date;
}

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

// ─── Randevu alırken gelen veri
export interface CreateAppointmentDTO {
    provider_id: string;
    service_ids: string[];
    appointment_date: string;  // "2026-03-15"
    start_time: string;        // "14:00"
    notes?: string;
}

// ─── API response
export interface AppointmentResponse {
    id: string;
    customer_id: string;
    provider_id: string;
    appointment_date: string;
    start_time: string;
    end_time: string;
    status: AppointmentStatus;
    notes?: string;
    total_price: number;
    payment_status: PaymentStatus;
    stripe_payment_intent_id?: string;
    created_at: Date;
    customer_name?: string;
    provider_name?: string;
    service_name?: string;
}