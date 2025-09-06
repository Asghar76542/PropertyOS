import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563EB', // Blue-600
    primaryContainer: '#DBEAFE',
    secondary: '#10B981', // Emerald-500  
    secondaryContainer: '#D1FAE5',
    tertiary: '#8B5CF6', // Violet-500
    tertiaryContainer: '#EDE9FE',
    error: '#DC2626', // Red-600
    errorContainer: '#FEE2E2',
    surface: '#FFFFFF',
    surfaceVariant: '#F8FAFC',
    background: '#FAFAFA',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: '#1F2937',
    onSurfaceVariant: '#6B7280',
  },
};

export const colors = {
  primary: '#2563EB',
  secondary: '#10B981',
  tertiary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#0EA5E9',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
