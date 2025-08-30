import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { NotificationProvider } from './src/components/NotificationManager';

// Tema personalizado para o React Native Paper v5
const theme = {
  colors: {
    primary: '#2196F3',
    onPrimary: '#ffffff',
    primaryContainer: '#E3F2FD',
    onPrimaryContainer: '#0D47A1',
    secondary: '#4CAF50',
    onSecondary: '#ffffff',
    secondaryContainer: '#E8F5E8',
    onSecondaryContainer: '#1B5E20',
    tertiary: '#FF9800',
    onTertiary: '#ffffff',
    tertiaryContainer: '#FFF3E0',
    onTertiaryContainer: '#E65100',
    error: '#F44336',
    onError: '#ffffff',
    errorContainer: '#FFEBEE',
    onErrorContainer: '#B71C1C',
    background: '#f5f5f5',
    onBackground: '#333333',
    surface: '#ffffff',
    onSurface: '#333333',
    surfaceVariant: '#F5F5F5',
    onSurfaceVariant: '#666666',
    outline: '#CCCCCC',
    outlineVariant: '#E0E0E0',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#333333',
    inverseOnSurface: '#ffffff',
    inversePrimary: '#90CAF9',
    elevation: {
      level0: 'transparent',
      level1: '#ffffff',
      level2: '#f8f8f8',
      level3: '#f0f0f0',
      level4: '#eeeeee',
      level5: '#e8e8e8',
    },
    surfaceDisabled: 'rgba(0, 0, 0, 0.12)',
    onSurfaceDisabled: 'rgba(0, 0, 0, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

export default function App() {
  return (
    <ErrorBoundary>
      <PaperProvider theme={theme}>
        <NotificationProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </AuthProvider>
        </NotificationProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}

