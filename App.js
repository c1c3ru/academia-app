import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, Text } from 'react-native';
import { Provider as PaperProvider, Portal } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Componentes e contextos
import { AuthProvider } from './src/contexts/AuthProvider';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import FirebaseInitializer from './src/components/FirebaseInitializer';
import WebCompatibility from './src/components/WebCompatibility';

console.log('🚀 App.js carregado - Platform:', Platform.OS);

export default function App() {
  useEffect(() => {
    console.log('🚀 App iniciando...', Platform.OS);
  }, []);

  const AppContent = () => (
    <ErrorBoundary>
      <FirebaseInitializer>
        <SafeAreaProvider>
          <ThemeProvider>
            <ThemedApp />
          </ThemeProvider>
        </SafeAreaProvider>
      </FirebaseInitializer>
    </ErrorBoundary>
  );

  const ThemedApp = () => {
    const { theme } = useTheme();
    
    return (
      <PaperProvider theme={theme}>
        <Portal.Host>
          <AuthProvider>
            <NotificationProvider>
              <StatusBar style="auto" />
              <AppNavigator />
            </NotificationProvider>
          </AuthProvider>
        </Portal.Host>
      </PaperProvider>
    );
  };

  // Para web, adicionar wrapper de compatibilidade
  if (Platform.OS === 'web') {
    return (
      <WebCompatibility>
        <AppContent />
      </WebCompatibility>
    );
  }

  return <AppContent />;
}