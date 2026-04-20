import api from './api';

export const appointmentService = {
  create: async (data: {
    provider_id: string;
    service_ids: string[];
    appointment_date: string;
    start_time: string;
    notes?: string;
  }) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  getMyAppointments: async () => {
    const response = await api.get('/appointments/my');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  confirm: async (id: string) => {
    const response = await api.patch(`/appointments/${id}/confirm`);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await api.patch(`/appointments/${id}/cancel`);
    return response.data;
  },

  complete: async (id: string) => {
    const response = await api.patch(`/appointments/${id}/complete`);
    return response.data;
  },
};

export const paymentService = {
  createIntent: async (appointmentId: string) => {
    const response = await api.post('/payments/create-intent', { appointment_id: appointmentId });
    return response.data;
  },

  confirmPayment: async (appointmentId: string) => {
    const response = await api.post('/payments/confirm', { appointment_id: appointmentId });
    return response.data;
  },
};
