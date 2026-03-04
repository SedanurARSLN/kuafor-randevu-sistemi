import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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

    // ─── KUAFÖRÜN HİZMETLERİNİ GETİR
    async getProviderServices(providerId: string): Promise<any[]> {
        const services = await this.userRepository.getProviderServices(providerId);
        return services;
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