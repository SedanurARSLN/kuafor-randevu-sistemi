import pool from '../config/database';
import { Appointment } from '../models/Appointment';
import { IAppointmentRepository } from '../interfaces/IAppointmentRepository';

export class AppointmentRepository implements IAppointmentRepository {

    async create(
        customerId: string,
        providerId: string,
        serviceIds: string,
        appointmentDate: string,
        startTime: string,
        totalPrice: number,
        notes?: string
    ): Promise<Appointment> {
        const query = `
            INSERT INTO appointments 
            (customer_id, provider_id, service_id, appointment_date, start_time, total_price, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [customerId, providerId, serviceIds, appointmentDate, startTime, totalPrice, notes || null];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async findById(id: string): Promise<any | null> {
        const query = `
            SELECT 
                a.*,
                c.full_name as customer_name,
                p.full_name as provider_name,
                array_agg(s.name) as service_names,
                array_agg(s.price) as service_prices
            FROM appointments a
            JOIN users c ON a.customer_id = c.id
            JOIN users p ON a.provider_id = p.id
            JOIN services s ON s.id = ANY(string_to_array(a.service_id, ',')::uuid[])
            WHERE a.id = $1
            GROUP BY a.id, c.full_name, p.full_name
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async findByCustomerId(customerId: string): Promise<any[]> {
        const query = `
            SELECT 
                a.*,
                p.full_name as provider_name,
                s.name as service_name,
                s.price as total_price
            FROM appointments a
            JOIN users p ON a.provider_id = p.id
            JOIN services s ON a.service_id = s.id
            WHERE a.customer_id = $1
            ORDER BY a.appointment_date DESC, a.start_time DESC
        `;
        const result = await pool.query(query, [customerId]);
        return result.rows;
    }

        async findByProviderAndDate(providerId: string, date: string): Promise<any[]> {
            const query = `
                SELECT 
                    a.*,
                    c.full_name as customer_name,
                    s.name as service_name,
                    s.price as total_price
                FROM appointments a
                JOIN users c ON a.customer_id = c.id
                JOIN services s ON a.service_id = s.id
                WHERE a.provider_id = $1
                AND a.appointment_date = $2
                AND a.status NOT IN ('cancelled')
                ORDER BY a.start_time ASC
            `;
            const result = await pool.query(query, [providerId, date]);
            return result.rows;
        }
    async findByProviderId(providerId: string): Promise<any[]> {
        const query = `
            SELECT 
                a.*,
                c.full_name as customer_name,
                s.name as service_name,
                s.price as total_price
            FROM appointments a
            JOIN users c ON a.customer_id = c.id
            JOIN services s ON a.service_id = s.id
            WHERE a.provider_id = $1
            ORDER BY a.appointment_date ASC, a.start_time ASC
        `;
        const result = await pool.query(query, [providerId]);
        return result.rows;
    }

    async findConflicting(
        providerId: string,
        appointmentDate: string,
        startTime: string
    ): Promise<Appointment[]> {
        const query = `
            SELECT * FROM appointments
            WHERE provider_id = $1
            AND appointment_date = $2
            AND status NOT IN ('cancelled')
            AND start_time = $3
        `;
        const result = await pool.query(query, [providerId, appointmentDate, startTime]);
        return result.rows;
    }

    async updateStatus(id: string, status: string): Promise<Appointment | null> {
        const query = `
            UPDATE appointments 
            SET status = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
        `;
        const result = await pool.query(query, [status, id]);
        return result.rows[0] || null;
    }
}