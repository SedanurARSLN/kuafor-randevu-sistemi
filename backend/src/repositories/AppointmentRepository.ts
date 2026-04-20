import pool from '../config/database';
import { Appointment } from '../models/Appointment';
import { IAppointmentRepository } from '../interfaces/IAppointmentRepository';

export class AppointmentRepository implements IAppointmentRepository {

    async create(
        customerId: string,
        providerId: string,
        serviceIds: string[],
        appointmentDate: string,
        startTime: string,
        endTime: string,
        totalPrice: number,
        notes?: string
    ): Promise<Appointment> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const apptResult = await client.query(
                `INSERT INTO appointments
                 (customer_id, provider_id, appointment_date, start_time, end_time, total_price, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
                [customerId, providerId, appointmentDate, startTime, endTime, totalPrice, notes || null]
            );
            const appointment = apptResult.rows[0];

            for (const serviceId of serviceIds) {
                await client.query(
                    `INSERT INTO appointment_services (appointment_id, service_id) VALUES ($1, $2)`,
                    [appointment.id, serviceId]
                );
            }

            await client.query('COMMIT');
            return appointment;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async findById(id: string): Promise<any | null> {
        const query = `
            SELECT
                a.*,
                c.full_name  AS customer_name,
                p.full_name  AS provider_name,
                array_agg(s.id::text)  AS service_ids,
                array_agg(s.name)      AS service_names,
                array_agg(s.price)     AS service_prices
            FROM appointments a
            JOIN users c ON a.customer_id = c.id
            JOIN users p ON a.provider_id = p.id
            JOIN appointment_services aps ON aps.appointment_id = a.id
            JOIN services s ON s.id = aps.service_id
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
                p.full_name             AS provider_name,
                array_agg(s.id::text)   AS service_ids,
                array_agg(s.name)       AS service_names,
                array_agg(s.price)      AS service_prices
            FROM appointments a
            JOIN users p ON a.provider_id = p.id
            JOIN appointment_services aps ON aps.appointment_id = a.id
            JOIN services s ON s.id = aps.service_id
            WHERE a.customer_id = $1
            GROUP BY a.id, p.full_name
            ORDER BY a.appointment_date DESC, a.start_time DESC
        `;
        const result = await pool.query(query, [customerId]);
        return result.rows;
    }

    async findByProviderAndDate(providerId: string, date: string): Promise<any[]> {
        const query = `
            SELECT 
                a.id, a.start_time, a.end_time, a.status
            FROM appointments a
            WHERE a.provider_id = $1
            AND a.appointment_date = $2
            AND a.status NOT IN ('cancelled', 'completed')
            ORDER BY a.start_time ASC
        `;
        const result = await pool.query(query, [providerId, date]);
        return result.rows;
    }

    async findByProviderId(providerId: string): Promise<any[]> {
        const query = `
            SELECT
                a.*,
                c.full_name             AS customer_name,
                array_agg(s.id::text)   AS service_ids,
                array_agg(s.name)       AS service_names,
                array_agg(s.price)      AS service_prices
            FROM appointments a
            JOIN users c ON a.customer_id = c.id
            JOIN appointment_services aps ON aps.appointment_id = a.id
            JOIN services s ON s.id = aps.service_id
            WHERE a.provider_id = $1
            GROUP BY a.id, c.full_name
            ORDER BY a.appointment_date ASC, a.start_time ASC
        `;
        const result = await pool.query(query, [providerId]);
        return result.rows;
    }

    async findConflicting(
        providerId: string,
        appointmentDate: string,
        startTime: string,
        endTime: string
    ): Promise<Appointment[]> {
        const query = `
            SELECT * FROM appointments
            WHERE provider_id = $1
            AND appointment_date = $2
            AND (
                status IN ('pending', 'confirmed')
                OR (status = 'completed' AND (appointment_date + start_time) > NOW())
            )
            AND start_time < $4::time
            AND end_time > $3::time
        `;
        const result = await pool.query(query, [providerId, appointmentDate, startTime, endTime]);
        return result.rows;
    }

    async getProviderEarnings(providerId: string): Promise<{
        daily: { total: number; count: number };
        weekly: { total: number; count: number };
        monthly: { total: number; count: number };
    }> {
        const query = `
            SELECT
                COALESCE(SUM(CASE WHEN appointment_date = CURRENT_DATE THEN total_price ELSE 0 END), 0) AS daily_total,
                COUNT(CASE WHEN appointment_date = CURRENT_DATE THEN 1 END) AS daily_count,
                COALESCE(SUM(CASE WHEN appointment_date >= date_trunc('week', CURRENT_DATE) THEN total_price ELSE 0 END), 0) AS weekly_total,
                COUNT(CASE WHEN appointment_date >= date_trunc('week', CURRENT_DATE) THEN 1 END) AS weekly_count,
                COALESCE(SUM(CASE WHEN appointment_date >= date_trunc('month', CURRENT_DATE) THEN total_price ELSE 0 END), 0) AS monthly_total,
                COUNT(CASE WHEN appointment_date >= date_trunc('month', CURRENT_DATE) THEN 1 END) AS monthly_count
            FROM appointments
            WHERE provider_id = $1
              AND status = 'completed'
        `;
        const result = await pool.query(query, [providerId]);
        const row = result.rows[0];
        return {
            daily:   { total: parseFloat(row.daily_total),   count: parseInt(row.daily_count) },
            weekly:  { total: parseFloat(row.weekly_total),  count: parseInt(row.weekly_count) },
            monthly: { total: parseFloat(row.monthly_total), count: parseInt(row.monthly_count) },
        };
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

    async updatePaymentStatus(id: string, paymentStatus: string, stripePaymentIntentId?: string): Promise<Appointment | null> {
        const query = `
            UPDATE appointments 
            SET payment_status = $1, stripe_payment_intent_id = COALESCE($3, stripe_payment_intent_id), updated_at = NOW()
            WHERE id = $2
            RETURNING *
        `;
        const result = await pool.query(query, [paymentStatus, id, stripePaymentIntentId || null]);
        return result.rows[0] || null;
    }
}
