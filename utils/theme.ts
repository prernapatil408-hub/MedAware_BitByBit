import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563EB',      // Blue
  primaryDark: '#1D4ED8',
  secondary: '#3B82F6',
  background: '#F8FAFC',   // Light blue-white
  card: '#FFFFFF',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  success: '#10B981',
  danger: '#EF4444',
  border: '#E2E8F0',
  shadow: '#00000020',
};

export const SHADOW = {
  button :{
  shadowColor: COLORS.shadow,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
  },
};

export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 24,
};
