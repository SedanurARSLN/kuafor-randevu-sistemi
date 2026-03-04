import pool from '../config/database';
import { User } from '../models/User';
import { IUserRepository } from '../interfaces/IUserRepository';

export class UserRepository implements IUserRepository {

    async findByEmail(email: string): Promise<User | null> {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    }

    async findById(id: string): Promise<User | null> {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    async create(fullName: string, email: string, passwordHash: string, phone: string | undefined, role: string): Promise<User> {
        const query = `
            INSERT INTO users (full_name, email, password_hash, phone, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [fullName, email, passwordHash, phone, role];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async findAll(): Promise<User[]> {
        const result = await pool.query('SELECT * FROM users');
        return result.rows;
    }

    async findByRole(role: string): Promise<User[]> {
        const result = await pool.query(
            'SELECT id, full_name, email, phone, role, created_at FROM users WHERE role = $1',
            [role]
        );
        return result.rows;
    }

    async getProviderServices(providerId: string): Promise<any[]> {
        const result = await pool.query(
            'SELECT * FROM services WHERE provider_id = $1 AND is_active = true',
            [providerId]
        );
        return result.rows;
    }

    async update(id: string, data: Partial<User>): Promise<User | null> {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
        const query = `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id, ...values]);
        return result.rows[0] || null;
    }
}