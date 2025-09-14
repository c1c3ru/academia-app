// Shared Components and Utilities
// Exportações centralizadas para componentes e utilitários compartilhados

// UI Components
export { default as OptimizedImage } from './components/OptimizedImage';
export { default as LazyScreen, LazyLoadingFallback, withLazyLoading } from './components/LazyScreen';
export { default as UniversalHeader } from './components/UniversalHeader';
export { default as ErrorBoundary } from './components/ErrorBoundary';
export { default as LoadingButton } from './components/LoadingButton';
export { default as FormInput } from './components/FormInput';
export { default as FormSelect } from './components/FormSelect';
export { default as ActionButton } from './components/ActionButton';
export { default as AnimatedButton } from './components/AnimatedButton';
export { default as AnimatedCard } from './components/AnimatedCard';
export { default as ResponsiveContainer } from './components/ResponsiveContainer';

// Form Components
export { default as CountryStatePicker } from './components/CountryStatePicker';
export { default as PhonePicker } from './components/PhonePicker';
export { default as ModalityPicker } from './components/ModalityPicker';

// Utility Components
export { default as QRCodeGenerator } from './components/QRCodeGenerator';
export { default as QRCodeScanner } from './components/QRCodeScanner';
export { default as NotificationBell } from './components/NotificationBell';
export { default as NotificationManager } from './components/NotificationManager';

// Stores
export { default as useAuthStore } from './stores/authStore';
export { default as useUIStore } from './stores/uiStore';
export { default as useAcademiaStore } from './stores/academiaStore';

// Services
export { default as firebase } from './services/firebase';
export { default as firestoreService } from './services/firestoreService';
export { default as notificationService } from './services/notificationService';

// Utils
export { default as performanceMonitor, usePerformanceMonitor, withPerformanceMonitoring } from './utils/performanceMonitor';
export * from './utils/validation';
export * from './utils/constants';
export * from './utils/platform';

// Hooks
export { useResponsive } from './hooks/useResponsive';

// Navigation
export { default as AuthNavigator } from './navigation/AuthNavigator';
export { default as SharedNavigator } from './navigation/SharedNavigator';

// Contexts (Legacy - para compatibilidade)
export { ThemeProvider, useTheme } from './contexts/ThemeContext';
export { NotificationProvider } from './contexts/NotificationContext';
