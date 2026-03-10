import api from './api';

export const providerAppointmentService = {
  // Belirli bir kuaför ve tarihteki randevuları getir
  getAppointmentsByDate: async (providerId: string, date: string) => {
    const response = await api.get(`/appointments/provider/${providerId}/date/${date}`);
    return response.data.data;
  },
};
