import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, User, LoginData, RegisterData } from '../services/authService';
import { setOnUnauthorized } from '../services/api';
import { registerForPushNotifications } from '../services/notificationService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    setOnUnauthorized(() => setUser(null));
  }, []);

  const checkAuth = async () => {
    try {
      const token = await authService.getToken();
      if (token) {
        const savedUser = await authService.getUser();
        setUser(savedUser);
        // Uygulama yeniden açıldığında push token'ı tazele
        registerForPushNotifications().catch(() => {});
      }
    } catch (error) {
      // silent fail - user stays logged out
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    const { user } = await authService.login(data);
    setUser(user);
    // Login sonrası push token kaydet
    registerForPushNotifications().catch(() => {});
  };

  const register = async (data: RegisterData) => {
    const { user } = await authService.register(data);
    setUser(user);
    // Kayıt sonrası push token kaydet
    registerForPushNotifications().catch(() => {});
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await import('../services/api').then(m => m.default.get('/auth/profile'));
      const updatedUser = response.data.data;
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch { /* silent */ }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};