/**
 * TestSprite Configuration
 * Configuração oficial do TestSprite para Academia App
 * Integração com React Native e Firebase
 */

module.exports = {
  // Configuração do TestSprite MCP
  testsprite: {
    apiKey: process.env.TESTSPRITE_API_KEY || "sk-user-T4f1zJ1SsMODsPjUlw8ijmvIlXwhIJLDVydI8vogJ_Lmz-TDOuW1CHxXfiDiMTn637gLncvEAL38ocauyGKvaoMvnMepbQphzC-SO9GKmChZSnXPW-bM3bBF6x9xU484jR0",
    projectType: "react-native",
    framework: "expo",
    testRunner: "jest"
  },
  // Configuração base do Jest
  preset: 'react-native',
  
  // Arquivos de setup
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/setup.js',
    '<rootDir>/testsprite/setup.js',
    '@testing-library/jest-native/extend-expect'
  ],
  
  // Padrões de arquivos de teste
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}',
    '<rootDir>/testsprite/**/*.test.{js,jsx,ts,tsx}'
  ],
  
  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/**/index.js',
    '!src/services/firebase.js',
    '!**/node_modules/**'
  ],
  
  // Limites de cobertura
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  
  // Mapeamento de módulos
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@testsprite/(.*)$': '<rootDir>/testsprite/$1'
  },
  
  // Transformações
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-paper|react-native-vector-icons|@react-navigation|react-native-calendars|expo|@expo|expo-notifications|expo-device|expo-modules-core)/)'
  ],
  
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Extensões de arquivo
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Configurações específicas do TestSprite
  globals: {
    __TESTSPRITE__: true,
    __DEV__: true
  },
  
  // Timeouts
  testTimeout: 10000,
  
  // Relatórios
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './coverage/html-report',
      filename: 'report.html',
      expand: true
    }]
  ],
  
  // Cache
  clearMocks: true,
  restoreMocks: true,
  
  // Configurações avançadas do TestSprite
  testsprite: {
    // Configurações de mock automático
    autoMock: {
      firebase: true,
      asyncStorage: true,
      navigation: true
    },
    
    // Configurações de snapshot
    snapshot: {
      updateOnFail: false,
      threshold: 0.8
    },
    
    // Configurações de performance
    performance: {
      maxTestDuration: 5000,
      memoryLimit: '512MB'
    }
  }
};
