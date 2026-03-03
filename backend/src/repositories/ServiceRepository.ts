import pool from '../config/database';
import { Service } from '../models/Service';
import { IServiceRepository } from '../interfaces/IServiceRepository';

export class ServiceRepository implements IServiceRepository {

    async create(
        providerId: string,
        name: string,
        description: string | undefined,
        durationMinutes: number,
        price: number
    ): Promise<Service> {
        const query = `
            INSERT INTO services (provider_id, name, description, duration_min, price)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [providerId, name, description || null, durationMinutes, price];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async findByProviderId(providerId: string): Promise<Service[]> {
        const query = `
            SELECT *, duration_min as duration_minutes FROM services 
            WHERE provider_id = $1 AND is_active = true
            ORDER BY created_at ASC
        `;
        const result = await pool.query(query, [providerId]);
        return result.rows;
    }

    async findById(id: string): Promise<Service | null> {
        const query = 'SELECT *, duration_min as duration_minutes FROM services WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async update(id: string, data: Partial<Service>): Promise<Service | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        // duration_minutes → duration_min dönüşümü
        const dbData: any = { ...data };
        if (dbData.duration_minutes !== undefined) {
            dbData.duration_min = dbData.duration_minutes;
            delete dbData.duration_minutes;
        }

        Object.entries(dbData).forEach(([key, value]) => {
            if (value !== undefined && key !== 'id' && key !== 'provider_id') {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });

        if (fields.length === 0) return null;

        fields.push(`updated_at = NOW()`);
        values.push(id);

        const query = `
            UPDATE services 
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *, duration_min as duration_minutes
        `;

        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }

    async deactivate(id: string): Promise<Service | null> {
        const query = `
            UPDATE services 
            SET is_active = false, updated_at = NOW()
            WHERE id = $1
            RETURNING *, duration_min as duration_minutes
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }
}