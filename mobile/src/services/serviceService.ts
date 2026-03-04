import api from './api';

export const serviceService = {
  // Kuaförün hizmetlerini getir
  getByProvider: async (providerId: string) => {
    const response = await api.get(`/services/provider/${providerId}`);
    return response.data;
  },

  // Kendi hizmetlerimi getir
  getMyServices: async () => {
    const response = await api.get('/services/my');
    return response.data;
  },
};