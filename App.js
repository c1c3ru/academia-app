import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from 'react-native-elements';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { NotificationProvider } from './src/components/NotificationManager';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

// Tema personalizado para React Native Elements
const theme = {
  colors: {
    primary: '#2196F3',
    secondary: '#4CAF50',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    text: '#333333',
    grey0: '#ffffff',
    grey1: '#f5f5f5',
    grey2: '#e0e0e0',
    grey3: '#bdbdbd',
    grey4: '#9e9e9e',
    grey5: '#757575',
    searchBg: '#f5f5f5',
    platform: {
      ios: {
        primary: '#2196F3',
        secondary: '#4CAF50',
        grey: '#f5f5f5',
        searchBg: '#dcdce1',
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
      },
      android: {
        primary: '#2196F3',
        secondary: '#4CAF50',
        grey: '#f5f5f5',
        searchBg: '#dcdce1',
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
      },
      web: {
        primary: '#2196F3',
        secondary: '#4CAF50',
        grey: '#f5f5f5',
        searchBg: '#dcdce1',
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
      },
    },
  },
  Button: {
    buttonStyle: {
      borderRadius: 12,
    },
    titleStyle: {
      fontWeight: '600',
    },
  },
  Input: {
    inputContainerStyle: {
      borderRadius: 8,
    },
  },
  Card: {
    containerStyle: {
      borderRadius: 12,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider theme={theme}>
          <NotificationProvider>
            <AuthProvider>
              <StatusBar style="auto" />
              <AppNavigator />
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
