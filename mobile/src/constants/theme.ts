export const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',
  secondary: '#F59E0B',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  white: '#FFFFFF',
  black: '#1E293B',
  gray: '#64748B',
  lightGray: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  pending: '#F59E0B',
  confirmed: '#10B981',
  cancelled: '#EF4444',
  completed: '#6366F1',
};

export const GRADIENTS = {
  primary: ['#3B82F6', '#1D4ED8'] as const,
  primaryDark: ['#2563EB', '#1D4ED8'] as const,
  success: ['#10B981', '#059669'] as const,
  warning: ['#F59E0B', '#D97706'] as const,
  danger: ['#EF4444', '#DC2626'] as const,
  purple: ['#8B5CF6', '#6D28D9'] as const,
};

export const FONTS = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

export const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  title: 28,
  padding: 16,
  radius: 12,
  radiusLg: 20,
  radiusXl: 32,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const API_URL = "https://kuafor-randevu-sistemi-3shp.onrender.com/api";
