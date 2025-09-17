import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import AdminStudents from '../admin/AdminStudents';
import { AuthProvider } from '../../contexts/AuthProvider';
import { firestoreService, paymentService } from '../../services/firestoreService';

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
    academia: global.mockAcademia
  })
}));

describe('AdminStudents Integration', () => {
  const mockStudents = [
    {
      id: 'student1',
      name: 'João Silva',
      email: 'joao@test.com',
      phone: '11999999999',
      userType: 'student',
      isActive: true,
      currentGraduation: 'Faixa Branca'
    },
    {
      id: 'student2',
      name: 'Maria Santos',
      email: 'maria@test.com',
      phone: '11888888888',
      userType: 'student',
      isActive: false,
      currentGraduation: 'Faixa Azul'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    firestoreService.getAll = jest.fn().mockImplementation((collection) => {
      if (collection === 'users') {
        return Promise.resolve(mockStudents);
      }
      return Promise.resolve([]);
    });

    paymentService.getPaymentsByStudent = jest.fn().mockResolvedValue([
      { id: 'payment1', status: 'paid', createdAt: { seconds: Date.now() / 1000 } }
    ]);
  });

  it('renders student list after loading', async () => {
    const { getByText, queryByText } = render(
      <TestWrapper>
        <AdminStudents navigation={mockNavigation} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(queryByText('Carregando...')).toBeNull();
      expect(getByText('João Silva')).toBeTruthy();
      expect(getByText('Maria Santos')).toBeTruthy();
    });
  });

  it('displays student information correctly', async () => {
    const { getByText } = render(
      <TestWrapper>
        <AdminStudents navigation={mockNavigation} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('joao@test.com')).toBeTruthy();
      expect(getByText('11999999999')).toBeTruthy();
      expect(getByText('Faixa Branca')).toBeTruthy();
      expect(getByText('Ativo')).toBeTruthy();
      expect(getByText('Inativo')).toBeTruthy();
    });
  });

  it('filters students by search query', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <TestWrapper>
        <AdminStudents navigation={mockNavigation} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('João Silva')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Buscar alunos...');
    fireEvent.changeText(searchInput, 'João');

    await waitFor(() => {
      expect(getByText('João Silva')).toBeTruthy();
      expect(queryByText('Maria Santos')).toBeNull();
    });
  });

  it('filters students by status', async () => {
    const { getByText, queryByText } = render(
      <TestWrapper>
        <AdminStudents navigation={mockNavigation} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('João Silva')).toBeTruthy();
      expect(getByText('Maria Santos')).toBeTruthy();
    });

    // Open filter menu
    const filterButton = getByText('Todos');
    fireEvent.press(filterButton);

    // Select active filter
    const activeFilter = getByText('Ativos');
    fireEvent.press(activeFilter);

    await waitFor(() => {
      expect(getByText('João Silva')).toBeTruthy();
      expect(queryByText('Maria Santos')).toBeNull();
    });
  });

  it('navigates to student details when student is pressed', async () => {
    const { getByText } = render(
      <TestWrapper>
        <AdminStudents navigation={mockNavigation} />
      </TestWrapper>
    );

    await waitFor(() => {
      const studentCard = getByText('João Silva');
      fireEvent.press(studentCard);
    });

    expect(mockNavigate).toHaveBeenCalledWith('StudentDetails', {
      studentId: 'student1',
      studentData: expect.objectContaining({ name: 'João Silva' })
    });
  });

  it('navigates to add student screen when FAB is pressed', async () => {
    const { getByText } = render(
      <TestWrapper>
        <AdminStudents navigation={mockNavigation} />
      </TestWrapper>
    );

    await waitFor(() => {
      const addButton = getByText('Novo Aluno');
      fireEvent.press(addButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('AddStudent');
  });

  it('shows student statistics', async () => {
    const { getByText } = render(
      <TestWrapper>
        <AdminStudents navigation={mockNavigation} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('Estatísticas Gerais')).toBeTruthy();
      expect(getByText('2')).toBeTruthy(); // Total students
      expect(getByText('1')).toBeTruthy(); // Active students
    });
  });

  it('handles refresh functionality', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <AdminStudents navigation={mockNavigation} />
      </TestWrapper>
    );

    await waitFor(() => {
      const scrollView = getByTestId('students-scroll');
      fireEvent(scrollView, 'refresh');
    });

    expect(firestoreService.getAll).toHaveBeenCalledTimes(2); // Initial + refresh
  });

  it('shows empty state when no students found', async () => {
    firestoreService.getAll.mockResolvedValue([]);

    const { getByText } = render(
      <TestWrapper>
        <AdminStudents navigation={mockNavigation} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('Nenhum aluno encontrado')).toBeTruthy();
      expect(getByText('Nenhum aluno cadastrado ainda')).toBeTruthy();
    });
  });

  it('navigates to student payments when payment button is pressed', async () => {
    const { getByText } = render(
      <TestWrapper>
        <AdminStudents navigation={mockNavigation} />
      </TestWrapper>
    );

    await waitFor(() => {
      const paymentsButton = getByText('Pagamentos');
      fireEvent.press(paymentsButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('StudentPayments', {
      studentId: expect.any(String)
    });
  });
});
