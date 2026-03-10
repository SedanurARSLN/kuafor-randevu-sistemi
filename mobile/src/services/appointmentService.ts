import api from './api';

export const appointmentService = {
  // Randevu oluştur
  create: async (data: {
    provider_id: string;
    service_ids: string[];
    appointment_date: string;
    start_time: string;
    notes?: string;
    total_price: number;
  }) => {
    // Backend'in beklediği formata dönüştür
    const payload = {
      provider_id: data.provider_id,
      service_ids: data.service_ids,
      appointment_date: data.appointment_date,
      start_time: data.start_time,
      notes: data.notes,
      total_price: data.total_price,
    };
    const response = await api.post('/appointments', payload);
    return response.data;
  },

  // Randevularımı getir
  getMyAppointments: async () => {
    const response = await api.get('/appointments/my');
    return response.data;
  },

  // Randevu detayı
  getById: async (id: string) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Randevu onayla (kuaför)
  confirm: async (id: string) => {
    const response = await api.patch(`/appointments/${id}/confirm`);
    return response.data;
  },

  // Randevu iptal
  cancel: async (id: string) => {
    const response = await api.patch(`/appointments/${id}/cancel`);
    return response.data;
  },

  // Randevu tamamla (kuaför)
  complete: async (id: string) => {
    const response = await api.patch(`/appointments/${id}/complete`);
    return response.data;
  },
};