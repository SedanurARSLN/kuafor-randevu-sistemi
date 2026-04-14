import { AppointmentService } from '../services/AppointmentService';
import { IAppointmentRepository } from '../interfaces/IAppointmentRepository';
import { IServiceRepository } from '../interfaces/IServiceRepository';
import { AppError } from '../utils/AppError';

const mockService = {
  id: 'svc-1',
  provider_id: 'provider-1',
  name: 'Sac Kesimi',
  description: '',
  duration_min: 30,
  price: 150,
  is_active: true,
  created_at: new Date(),
};

const mockAppointment = {
  id: 'appt-1',
  customer_id: 'customer-1',
  service_id: 'svc-1',
  provider_id: 'provider-1',
  appointment_date: '2026-04-20',
  start_time: '10:00',
  end_time: '10:30',
  status: 'pending',
  total_price: 150,
  notes: '',
  created_at: new Date(),
  updated_at: new Date(),
  customer_name: 'Test Customer',
  provider_name: 'Test Provider',
  service_name: 'Sac Kesimi',
};

function createMockAppointmentRepo(overrides: Partial<IAppointmentRepository> = {}): IAppointmentRepository {
  return {
    create: jest.fn().mockResolvedValue(mockAppointment),
    findById: jest.fn().mockResolvedValue(mockAppointment),
    findByCustomerId: jest.fn().mockResolvedValue([mockAppointment]),
    findByProviderId: jest.fn().mockResolvedValue([mockAppointment]),
    findByProviderAndDate: jest.fn().mockResolvedValue([]),
    findConflicting: jest.fn().mockResolvedValue([]),
    getProviderEarnings: jest.fn().mockResolvedValue({ daily: { total: 0, count: 0 }, weekly: { total: 0, count: 0 }, monthly: { total: 0, count: 0 } }),
    updateStatus: jest.fn().mockResolvedValue(mockAppointment),
    updatePaymentStatus: jest.fn().mockResolvedValue(mockAppointment),
    ...overrides,
  };
}

function createMockServiceRepo(overrides: Partial<IServiceRepository> = {}): IServiceRepository {
  return {
    findById: jest.fn().mockResolvedValue(mockService),
    findByProviderId: jest.fn().mockResolvedValue([mockService]),
    create: jest.fn().mockResolvedValue(mockService),
    update: jest.fn().mockResolvedValue(mockService),
    deactivate: jest.fn().mockResolvedValue(mockService),
    ...overrides,
  };
}

describe('AppointmentService', () => {
  describe('createAppointment', () => {
    it('should throw error if no service ids provided', async () => {
      const appointmentRepo = createMockAppointmentRepo();
      const serviceRepo = createMockServiceRepo({
        findById: jest.fn().mockResolvedValue(null),
      });
      const service = new AppointmentService(appointmentRepo, serviceRepo);

      await expect(
        service.createAppointment('customer-1', {
          provider_id: 'provider-1',
          appointment_date: '2026-04-20',
          start_time: '10:00',
          service_ids: ['nonexist'],
        } as any)
      ).rejects.toThrow('Seçilen hizmetlerden biri bulunamadı');
    });

    it('should throw error if service is inactive', async () => {
      const appointmentRepo = createMockAppointmentRepo();
      const serviceRepo = createMockServiceRepo({
        findById: jest.fn().mockResolvedValue({ ...mockService, is_active: false }),
      });
      const service = new AppointmentService(appointmentRepo, serviceRepo);

      await expect(
        service.createAppointment('customer-1', {
          provider_id: 'provider-1',
          appointment_date: '2026-04-20',
          start_time: '10:00',
          service_ids: ['svc-1'],
        } as any)
      ).rejects.toThrow('Seçilen hizmetlerden biri aktif değil');
    });

    it('should throw error if service belongs to different provider', async () => {
      const appointmentRepo = createMockAppointmentRepo();
      const serviceRepo = createMockServiceRepo({
        findById: jest.fn().mockResolvedValue({ ...mockService, provider_id: 'other-provider' }),
      });
      const service = new AppointmentService(appointmentRepo, serviceRepo);

      await expect(
        service.createAppointment('customer-1', {
          provider_id: 'provider-1',
          appointment_date: '2026-04-20',
          start_time: '10:00',
          service_ids: ['svc-1'],
        } as any)
      ).rejects.toThrow('Seçilen hizmetlerden biri bu kuaföre ait değil');
    });

    it('should throw error if customer books themselves', async () => {
      const appointmentRepo = createMockAppointmentRepo();
      const serviceRepo = createMockServiceRepo();
      const service = new AppointmentService(appointmentRepo, serviceRepo);

      await expect(
        service.createAppointment('provider-1', {
          provider_id: 'provider-1',
          appointment_date: '2026-04-20',
          start_time: '10:00',
          service_ids: ['svc-1'],
        } as any)
      ).rejects.toThrow('Kendinize randevu alamazsınız');
    });

    it('should throw error for past date', async () => {
      const appointmentRepo = createMockAppointmentRepo();
      const serviceRepo = createMockServiceRepo();
      const service = new AppointmentService(appointmentRepo, serviceRepo);

      await expect(
        service.createAppointment('customer-1', {
          provider_id: 'provider-1',
          appointment_date: '2020-01-01',
          start_time: '10:00',
          service_ids: ['svc-1'],
        } as any)
      ).rejects.toThrow('Geçmiş tarihe randevu alınamaz');
    });
  });
});
