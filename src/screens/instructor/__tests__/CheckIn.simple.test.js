/**
 * TestSprite - Teste Simples para CheckIn
 * Teste básico para verificar se a configuração está funcionando
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';

// Mock básico dos serviços
jest.mock('../../../services/academyFirestoreService', () => ({
  academyFirestoreService: {
    getWhere: jest.fn().mockResolvedValue([]),
    getDocuments: jest.fn().mockResolvedValue([]),
    getAll: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue('mock-id'),
    update: jest.fn().mockResolvedValue(),
  },
  academyClassService: {
    getClassesByInstructor: jest.fn().mockResolvedValue([]),
  },
}));

// Mock do contexto de autenticação
jest.mock('../../../contexts/AuthProvider', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id', email: 'test@example.com' },
    userProfile: { 
      id: 'test-profile-id',
      name: 'Test User',
      role: 'instructor',
      academiaId: 'test-academia-id'
    },
  }),
}));

// Mock da navegação
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

// Wrapper para testes
const TestWrapper = ({ children }) => (
  <PaperProvider>
    {children}
  </PaperProvider>
);

describe('TestSprite - CheckIn Screen (Teste Simples)', () => {
  it('deve renderizar sem erros', () => {
    // Teste básico apenas para verificar se a configuração funciona
    const TestComponent = () => <div>Test Component</div>;
    
    const { getByText } = render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(getByText('Test Component')).toBeTruthy();
  });

  it('deve ter mocks configurados corretamente', () => {
    const { academyFirestoreService } = require('../../../services/academyFirestoreService');
    
    expect(academyFirestoreService.getAll).toBeDefined();
    expect(typeof academyFirestoreService.getAll).toBe('function');
  });
});
