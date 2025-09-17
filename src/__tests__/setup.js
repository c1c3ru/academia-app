import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock React Native modules
jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
      Version: 25
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    },
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style)
    },
    View: 'View',
    Text: 'Text',
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
    TouchableHighlight: 'TouchableHighlight',
    ScrollView: 'ScrollView',
    FlatList: 'FlatList',
    Image: 'Image',
    Alert: {
      alert: jest.fn()
    },
    Animated: {
      timing: jest.fn(() => ({
        start: jest.fn()
      })),
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        interpolate: jest.fn(() => ({
          addListener: jest.fn(),
          removeListener: jest.fn(),
          removeAllListeners: jest.fn(),
        }))
      })),
      createAnimatedComponent: jest.fn(() => jest.fn()),
      View: 'Animated.View',
      Text: 'Animated.Text',
      ScrollView: 'Animated.ScrollView'
    },
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      quad: jest.fn(),
      cubic: jest.fn(),
      bezier: jest.fn(() => jest.fn()),
      in: jest.fn(() => jest.fn()),
      out: jest.fn(() => jest.fn()),
      inOut: jest.fn(() => jest.fn())
    },
    I18nManager: {
      isRTL: false,
      doLeftAndRightSwapInRTL: false,
      allowRTL: jest.fn(),
      forceRTL: jest.fn(),
      swapLeftAndRightInRTL: jest.fn(),
      getConstants: jest.fn(() => ({
        isRTL: false,
        doLeftAndRightSwapInRTL: false,
      })),
    }
  };
});

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

// Mock Firestore Service - removed to allow individual test mocks

// Mock Notifications
jest.mock('../services/notificationService', () => {
  const mockNotificationService = {
    scheduleClassReminders: jest.fn(),
    sendLocalNotification: jest.fn(),
    requestPermissions: jest.fn(),
    notifyPaymentDue: jest.fn()
  };
  
  return {
    default: mockNotificationService,
    ...mockNotificationService
  };
});

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
