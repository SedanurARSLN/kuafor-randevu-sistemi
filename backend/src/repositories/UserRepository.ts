import pool from '../config/database';
import { User } from '../models/User';
import { IUserRepository } from '../interfaces/IUserRepository';

// ─── Single Responsibility: SADECE veritabanı işlemleri yapar
// ─── İş mantığı YOKTUR burada (hash, token vs. yok)

export class UserRepository implements IUserRepository {

    async findByEmail(email: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0] || null;
    }

    async findById(id: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async create(
        fullName: string,
        email: string,
        passwordHash: string,
        phone: string | undefined,
        role: string
    ): Promise<User> {
        const query = `
            INSERT INTO users (full_name, email, password_hash, phone, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [fullName, email, passwordHash, phone || null, role];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async findAll(): Promise<User[]> {
        const query = 'SELECT * FROM users ORDER BY created_at DESC';
        const result = await pool.query(query);
        return result.rows;
    }

    async update(id: string, data: Partial<User>): Promise<User | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        // Dinamik güncelleme sorgusu oluştur
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && key !== 'id') {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });

        if (fields.length === 0) return null;

        fields.push(`updated_at = NOW()`);
        values.push(id);

        const query = `
            UPDATE users 
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }
}