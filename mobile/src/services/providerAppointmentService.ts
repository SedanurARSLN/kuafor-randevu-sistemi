import api from './api';

export const providerAppointmentService = {
  getAppointmentsByDate: async (providerId: string, date: string) => {
    const response = await api.get(`/appointments/provider/${providerId}/date/${date}`);
    return response.data.data;
  },

  getEarnings: async () => {
    const response = await api.get('/appointments/earnings');
    return response.data.data;
  },
};
