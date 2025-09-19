/**
 * TestSprite Setup
 * Configuração global para testes do Academia App
 */

import 'react-native-gesture-handler/jestSetup';

// Mock do React Native Paper
jest.mock('react-native-paper', () => {
  const RealModule = jest.requireActual('react-native-paper');
  const MockedModule = {
    ...RealModule,
    Portal: ({ children }) => children,
    Modal: ({ children, visible }) => visible ? children : null,
  };
  return MockedModule;
});

// Mock do Expo
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelNotificationAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
}));

jest.mock('expo-device', () => ({
  isDevice: true,
  deviceType: 1,
  deviceName: 'Test Device',
}));

// Mock do Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  })),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
}));

// Mock do AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock do React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }) => children,
}));

// Mock de componentes nativos
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock do Alert
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios),
    },
  };
});

// Configurações globais do TestSprite
global.__TESTSPRITE__ = true;
global.__DEV__ = true;

// Helper functions para testes
global.TestSprite = {
  // Mock de usuário autenticado
  mockAuthUser: (userData = {}) => ({
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    ...userData,
  }),
  
  // Mock de perfil de usuário
  mockUserProfile: (profileData = {}) => ({
    id: 'test-profile-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'student',
    academiaId: 'test-academia-id',
    ...profileData,
  }),
  
  // Mock de academia
  mockAcademia: (academiaData = {}) => ({
    id: 'test-academia-id',
    name: 'Test Academia',
    address: 'Test Address',
    phone: '(11) 99999-9999',
    ...academiaData,
  }),
  
  // Mock de turma
  mockClass: (classData = {}) => ({
    id: 'test-class-id',
    name: 'Test Class',
    modality: 'Jiu-Jitsu',
    instructor: 'Test Instructor',
    maxStudents: 20,
    currentStudents: 10,
    schedule: 'Segunda 19:00',
    ...classData,
  }),
  
  // Mock de aluno
  mockStudent: (studentData = {}) => ({
    id: 'test-student-id',
    name: 'Test Student',
    email: 'student@example.com',
    phone: '(11) 88888-8888',
    belt: 'Branca',
    ...studentData,
  }),
  
  // Helper para renderizar com providers
  renderWithProviders: (component, options = {}) => {
    const { render } = require('@testing-library/react-native');
    const { Provider as PaperProvider } = require('react-native-paper');
    const React = require('react');
    
    const AllTheProviders = ({ children }) => {
      return React.createElement(PaperProvider, {}, children);
    };
    
    return render(component, { wrapper: AllTheProviders, ...options });
  },
  
  // Helper para aguardar operações assíncronas
  waitFor: async (callback, timeout = 5000) => {
    const { waitFor } = require('@testing-library/react-native');
    return waitFor(callback, { timeout });
  },
  
  // Helper para simular delay
  delay: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Configurar console para testes
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});
