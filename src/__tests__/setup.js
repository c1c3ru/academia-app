import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock Firebase
jest.mock('../services/firebase', () => ({
  auth: {
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn()
  },
  db: {
    collection: jest.fn(),
    doc: jest.fn()
  }
}));

// Mock Expo modules
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient'
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialCommunityIcons: 'MaterialCommunityIcons'
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn()
  }),
  useRoute: () => ({
    params: {}
  }),
  useFocusEffect: jest.fn()
}));

// Mock React Native Paper
jest.mock('react-native-paper', () => {
  const RealModule = jest.requireActual('react-native-paper');
  const MockedModule = {
    ...RealModule,
    Portal: ({ children }) => children,
    Modal: ({ children, visible }) => visible ? children : null
  };
  return MockedModule;
});

// Mock React Native Safe Area Context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 })
}));

// Mock React Native Calendars
jest.mock('react-native-calendars', () => ({
  Calendar: 'Calendar',
  LocaleConfig: {
    locales: {},
    defaultLocale: 'en'
  }
}));

// Mock Notifications
jest.mock('../services/notificationService', () => ({
  scheduleClassReminders: jest.fn(),
  sendLocalNotification: jest.fn(),
  requestPermissions: jest.fn()
}));

// Global test utilities
global.mockFirebaseUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User'
};

global.mockUserProfile = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  userType: 'student',
  academiaId: 'test-academia-id',
  isActive: true
};

global.mockAcademia = {
  id: 'test-academia-id',
  nome: 'Test Academia',
  codigo: 'TEST123',
  endereco: 'Test Address'
};

// Console warnings suppression for tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
