
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    secondary: '#FF9800',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    text: '#212121',
    disabled: '#BDBDBD',
  },
  roundness: 8,
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#64B5F6',
    secondary: '#FFB74D',
    background: '#121212',
    surface: '#1E1E1E',
    error: '#CF6679',
    success: '#81C784',
    warning: '#FFB74D',
    text: '#FFFFFF',
    disabled: '#6D6D6D',
  },
  roundness: 8,
};

// Languages configuration
export const languages = {
  pt: {
    code: 'pt',
    name: 'Português',
    flag: '🇧🇷',
    strings: {
      // Login Screen
      appName: 'Academia App',
      welcome: 'Bem-vindo de volta!',
      email: 'Email',
      password: 'Senha',
      login: 'Entrar',
      forgotPassword: 'Esqueci minha senha',
      register: 'Criar conta',
      language: 'Idioma',
      darkMode: 'Modo escuro',
      error: 'Erro',
      fillAllFields: 'Por favor, preencha todos os campos',
      loginError: 'Erro no Login',
      checkCredentials: 'Verifique suas credenciais',
      userNotFound: 'Usuário não encontrado',
      wrongPassword: 'Senha incorreta',
      invalidEmail: 'Email inválido',
      loggingIn: 'Fazendo login...',
    }
  },
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    strings: {
      // Login Screen
      appName: 'Academia App',
      welcome: 'Welcome back!',
      email: 'Email',
      password: 'Password',
      login: 'Login',
      forgotPassword: 'Forgot password',
      register: 'Create account',
      language: 'Language',
      darkMode: 'Dark mode',
      error: 'Error',
      fillAllFields: 'Please fill all fields',
      loginError: 'Login Error',
      checkCredentials: 'Check your credentials',
      userNotFound: 'User not found',
      wrongPassword: 'Wrong password',
      invalidEmail: 'Invalid email',
      loggingIn: 'Logging in...',
    }
  },
  es: {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
    strings: {
      // Login Screen
      appName: 'Academia App',
      welcome: '¡Bienvenido de vuelta!',
      email: 'Correo electrónico',
      password: 'Contraseña',
      login: 'Iniciar sesión',
      forgotPassword: 'Olvidé mi contraseña',
      register: 'Crear cuenta',
      language: 'Idioma',
      darkMode: 'Modo oscuro',
      error: 'Error',
      fillAllFields: 'Por favor, completa todos los campos',
      loginError: 'Error de inicio de sesión',
      checkCredentials: 'Verifica tus credenciales',
      userNotFound: 'Usuario no encontrado',
      wrongPassword: 'Contraseña incorrecta',
      invalidEmail: 'Correo electrónico inválido',
      loggingIn: 'Iniciando sesión...',
    }
  }
};

export { lightTheme, darkTheme };
export default lightTheme;
