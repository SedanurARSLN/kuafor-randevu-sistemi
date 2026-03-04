import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'provider';
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'customer' | 'provider';
}

export const authService = {
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    const { token, user } = response.data.data;
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  },

  register: async (data: RegisterData) => {
  // role'e göre doğru rota seç
  const endpoint = data.role === 'customer' 
    ? '/auth/register/customer' 
    : '/auth/register/provider';
  
  const response = await api.post(endpoint, data);
  const { token, user } = response.data.data;
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('user', JSON.stringify(user));
  return { token, user };
},

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  getUser: async (): Promise<User | null> => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem('token');
  },
};