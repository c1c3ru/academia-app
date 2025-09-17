import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import AdminDashboard from '../admin/AdminDashboard';
import { AuthProvider } from '../../contexts/AuthProvider';
import { firestoreService } from '../../services/firestoreService';

const TestWrapper = ({ children }) => (
  <NavigationContainer>
    <PaperProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </PaperProvider>
  </NavigationContainer>
);

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  setOptions: jest.fn()
};

// Mock Auth Context
jest.mock('../../contexts/AuthProvider', () => ({
  ...jest.requireActual('../../contexts/AuthProvider'),
  useAuth: () => ({
    user: global.mockFirebaseUser,
    userProfile: { ...global.mockUserProfile, userType: 'admin' },
    academia: global.mockAcademia,
    logout: jest.fn()
  })
}));

// Mock Firestore Service
jest.mock('../../services/firestoreService', () => ({
  firestoreService: {
    getAll: jest.fn(),
  },
  paymentService: {
    getPaymentsByStudent: jest.fn()
  },
  announcementService: {
    getActiveAnnouncements: jest.fn()
  }
}));

describe('AdminDashboard Integration', () => {
  const mockStudents = [
    { id: 'student1', userType: 'student', name: 'Student 1', isActive: true },
    { id: 'student2', userType: 'student', name: 'Student 2', isActive: false }
  ];

  const mockClasses = [
    { id: 'class1', name: 'Jiu-Jitsu Básico', modality: 'Jiu-Jitsu' },
    { id: 'class2', name: 'Muay Thai Avançado', modality: 'Muay Thai' }
  ];

  const mockPayments = [
    { id: 'payment1', status: 'paid', amount: 150, createdAt: { seconds: Date.now() / 1000 } },
    { id: 'payment2', status: 'pending', amount: 150, createdAt: { seconds: Date.now() / 1000 } }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    firestoreService.getAll.mockImplementation((collection) => {
      switch (collection) {
        case 'users':
          return Promise.resolve([...mockStudents, { id: 'instructor1', userType: 'instructor' }]);
        case 'classes':
          return Promise.resolve(mockClasses);
        case 'payments':
          return Promise.resolve(mockPayments);
        default:
          return Promise.resolve([]);
      }
    });
  });

  it('renders dashboard with loading state initially', () => {
    const { getByText } = render(
      <TestWrapper>
        <AdminDashboard navigation={mockNavigation} />
      </TestWrapper>
    );

    expect(getByText('Carregando modalidades...')).toBeTruthy();
  });

  it('displays dashboard statistics after loading', async () => {
    const { getByText, queryByText } = render(
      <TestWrapper>
        <AdminDashboard navigation={mockNavigation} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(queryByText('Carregando modalidades...')).toBeNull();
    });

    // Check if statistics are displayed
    await waitFor(() => {
      expect(getByText('2')).toBeTruthy(); // Total students
      expect(getByText('1')).toBeTruthy(); // Active students
      expect(getByText('2')).toBeTruthy(); // Total classes
    });
  });

  it('displays welcome message with user name', async () => {
    const { getByText } = render(
      <TestWrapper>
        <AdminDashboard navigation={mockNavigation} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText(/Olá, Test!/)).toBeTruthy();
    });
  });

  it('shows financial information', async () => {
    const { getByText } = render(
      <TestWrapper>
        <AdminDashboard navigation={mockNavigation} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('Financeiro do Mês')).toBeTruthy();
      expect(getByText('1')).toBeTruthy(); // Pending payments
    });
  });

  it('navigates to management screens when quick actions are pressed', async () => {
    const { getByText } = render(
      <TestWrapper>
        <AdminDashboard navigation={mockNavigation} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('Ações Rápidas')).toBeTruthy();
    });

    const studentsButton = getByText('Abrir');
    fireEvent.press(studentsButton);

    expect(mockNavigate).toHaveBeenCalled();
  });

  it('shows QR code modal when QR button is pressed', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <AdminDashboard navigation={mockNavigation} />
      </TestWrapper>
    );

    await waitFor(() => {
      const qrButton = getByTestId('qr-scan-button');
      fireEvent.press(qrButton);
    });

    await waitFor(() => {
      expect(getByTestId('qr-modal')).toBeTruthy();
    });
  });

  it('handles refresh functionality', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <AdminDashboard navigation={mockNavigation} />
      </TestWrapper>
    );

    await waitFor(() => {
      const scrollView = getByTestId('dashboard-scroll');
      fireEvent(scrollView, 'refresh');
    });

    expect(firestoreService.getAll).toHaveBeenCalledTimes(6); // Initial load + refresh
  });

  it('displays alerts for overdue payments', async () => {
    const mockOverduePayments = [
      ...mockPayments,
      { id: 'payment3', status: 'overdue', amount: 150 }
    ];

    firestoreService.getAll.mockImplementation((collection) => {
      if (collection === 'payments') {
        return Promise.resolve(mockOverduePayments);
      }
      return Promise.resolve([]);
    });

    const { getByText } = render(
      <TestWrapper>
        <AdminDashboard navigation={mockNavigation} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('Alertas')).toBeTruthy();
      expect(getByText(/pagamento\(s\) em atraso/)).toBeTruthy();
    });
  });
});
