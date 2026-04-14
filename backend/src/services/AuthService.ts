import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { config } from '../config/environment';
import { IUserRepository } from '../interfaces/IUserRepository';
import {
    RegisterCustomerDTO,
    RegisterProviderDTO,
    LoginDTO,
    AuthResponse,
    UserResponse,
} from '../models/User';
import { AppError } from '../utils/AppError';

export class AuthService {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    // ─── MÜŞTERI KAYIT
    async registerCustomer(dto: RegisterCustomerDTO): Promise<AuthResponse> {
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new AppError('Bu email zaten kayıtlı', 400);
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const user = await this.userRepository.create(
            dto.full_name,
            dto.email,
            passwordHash,
            dto.phone,
            'customer'
        );

        const token = this.generateToken(user.id, user.role);

        return {
            user: this.toUserResponse(user),
            token,
        };
    }

    // ─── KUAFÖR (PROVIDER) KAYIT
    async registerProvider(dto: RegisterProviderDTO): Promise<AuthResponse> {
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new AppError('Bu email zaten kayıtlı', 400);
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const user = await this.userRepository.create(
            dto.full_name,
            dto.email,
            passwordHash,
            dto.phone,
            'provider'
        );

        const token = this.generateToken(user.id, user.role);

        return {
            user: this.toUserResponse(user),
            token,
        };
    }

    // ─── GİRİŞ
    async login(dto: LoginDTO): Promise<AuthResponse> {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            throw new AppError('Email veya şifre hatalı', 401);
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
        if (!isPasswordValid) {
            throw new AppError('Email veya şifre hatalı', 401);
        }

        const token = this.generateToken(user.id, user.role);

        return {
            user: this.toUserResponse(user),
            token,
        };
    }

    // ─── PROFİL GÖRÜNTÜLE
    async getProfile(userId: string): Promise<UserResponse> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError('Kullanıcı bulunamadı', 404);
        }
        return this.toUserResponse(user);
    }

    // ─── TÜM KUAFÖRLERİ LİSTELE
    async getAllProviders(): Promise<UserResponse[]> {
        const providers = await this.userRepository.findByRole('provider');
        return providers.map(user => this.toUserResponse(user));
    }

    // ─── HESAP SIL
    async deleteAccount(userId: string): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError('Kullanici bulunamadi', 404);
        }
        await this.userRepository.deleteById(userId);
    }

    // ─── KUAFÖRÜN HİZMETLERİNİ GETİR
    async getProviderServices(providerId: string): Promise<any[]> {
        const services = await this.userRepository.getProviderServices(providerId);
        return services;
    }

    // ─── ŞİFRE SIFIRLAMA - KOD GÖNDER
    async forgotPassword(email: string): Promise<void> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new AppError('Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı', 404);
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika

        await this.userRepository.update(user.id, {
            reset_code: resetCode,
            reset_code_expires: expires,
        } as any);

        if (config.smtpUser) {
            const transporter = nodemailer.createTransport({
                host: config.smtpHost,
                port: config.smtpPort,
                secure: config.smtpPort === 465,
                auth: { user: config.smtpUser, pass: config.smtpPass },
            });

            await transporter.sendMail({
                from: `"Kuaför Randevu" <${config.smtpUser}>`,
                to: email,
                subject: 'Şifre Sıfırlama Kodu',
                html: `<h2>Şifre Sıfırlama</h2>
                    <p>Şifre sıfırlama kodunuz: <strong>${resetCode}</strong></p>
                    <p>Bu kod 15 dakika geçerlidir.</p>`,
            });
        }
    }

    // ─── ŞİFRE SIFIRLAMA - KODU DOĞRULA VE GÜNCELLE
    async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new AppError('Kullanıcı bulunamadı', 404);
        }

        const userData = user as any;
        if (!userData.reset_code || userData.reset_code !== code) {
            throw new AppError('Geçersiz sıfırlama kodu', 400);
        }
        if (!userData.reset_code_expires || new Date(userData.reset_code_expires) < new Date()) {
            throw new AppError('Sıfırlama kodu süresi dolmuş', 400);
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await this.userRepository.update(user.id, {
            password_hash: passwordHash,
            reset_code: null,
            reset_code_expires: null,
        } as any);
    }

    // ─── PROFİL GÜNCELLE
    async updateProfile(userId: string, data: { full_name?: string; phone?: string; old_password?: string; new_password?: string }): Promise<UserResponse> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError('Kullanıcı bulunamadı', 404);
        }

        const updateData: any = {};
        if (data.full_name) updateData.full_name = data.full_name;
        if (data.phone) updateData.phone = data.phone;

        if (data.new_password) {
            if (!data.old_password) {
                throw new AppError('Mevcut şifre gereklidir', 400);
            }
            const isValid = await bcrypt.compare(data.old_password, user.password_hash);
            if (!isValid) {
                throw new AppError('Mevcut şifre hatalı', 400);
            }
            if (data.new_password.length < 6) {
                throw new AppError('Yeni şifre en az 6 karakter olmalıdır', 400);
            }
            updateData.password_hash = await bcrypt.hash(data.new_password, 12);
        }

        if (Object.keys(updateData).length === 0) {
            throw new AppError('Güncellenecek alan bulunamadı', 400);
        }

        const updated = await this.userRepository.update(userId, updateData);
        return this.toUserResponse(updated!);
    }

    // ─── YARDIMCI: JWT Token oluştur
    private generateToken(userId: string, role: string): string {
        const payload = { userId, role };
        const secret = config.jwtSecret;
        const expiresIn = config.jwtExpiresIn as string;

        return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
    }

    // ─── YARDIMCI: User → UserResponse (şifre hariç)
    private toUserResponse(user: any): UserResponse {
        return {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            created_at: user.created_at,
        };
    }
}