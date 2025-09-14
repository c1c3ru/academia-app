// Feature: Authentication
// Exportações centralizadas para o módulo de autenticação

// Screens
export { default as LoginScreen } from './screens/LoginScreen';
export { default as RegisterScreen } from './screens/RegisterScreen';
export { default as ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
export { default as UserTypeSelectionScreen } from './screens/UserTypeSelectionScreen';
export { default as AcademiaSelectionScreen } from './screens/AcademiaSelectionScreen';

// Components
export { default as ForgotPasswordButton } from './components/ForgotPasswordButton';
export { default as LoginDebugger } from './components/LoginDebugger';

// Services
export { default as authService } from './services/authService';

// Hooks
export { useAuthMigration } from './hooks/useAuthMigration';

// Store
export { default as useAuthStore } from './stores/authStore';
