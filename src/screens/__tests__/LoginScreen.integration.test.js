import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../auth/LoginScreen';
import { AuthProvider } from '../../contexts/AuthProvider';

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

describe('LoginScreen Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <LoginScreen navigation={mockNavigation} />
      </TestWrapper>
    );

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Senha')).toBeTruthy();
    expect(getByText('Entrar')).toBeTruthy();
    expect(getByText('Criar Conta')).toBeTruthy();
  });

  it('shows validation errors for empty fields', async () => {
    const { getByText } = render(
      <TestWrapper>
        <LoginScreen navigation={mockNavigation} />
      </TestWrapper>
    );

    const loginButton = getByText('Entrar');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Email é obrigatório')).toBeTruthy();
      expect(getByText('Senha é obrigatória')).toBeTruthy();
    });
  });

  it('shows validation error for invalid email', async () => {
    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <LoginScreen navigation={mockNavigation} />
      </TestWrapper>
    );

    const emailInput = getByPlaceholderText('Email');
    const loginButton = getByText('Entrar');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Email inválido')).toBeTruthy();
    });
  });

  it('attempts login with valid credentials', async () => {
    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <LoginScreen navigation={mockNavigation} />
      </TestWrapper>
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Senha');
    const loginButton = getByText('Entrar');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    // Should show loading state
    await waitFor(() => {
      expect(getByText('Entrando...')).toBeTruthy();
    });
  });

  it('navigates to register screen when create account is pressed', () => {
    const { getByText } = render(
      <TestWrapper>
        <LoginScreen navigation={mockNavigation} />
      </TestWrapper>
    );

    const createAccountButton = getByText('Criar Conta');
    fireEvent.press(createAccountButton);

    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('toggles password visibility', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <TestWrapper>
        <LoginScreen navigation={mockNavigation} />
      </TestWrapper>
    );

    const passwordInput = getByPlaceholderText('Senha');
    const toggleButton = getByTestId('password-toggle');

    expect(passwordInput.props.secureTextEntry).toBe(true);

    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(false);

    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('handles forgot password action', () => {
    const { getByText } = render(
      <TestWrapper>
        <LoginScreen navigation={mockNavigation} />
      </TestWrapper>
    );

    const forgotPasswordButton = getByText('Esqueci minha senha');
    fireEvent.press(forgotPasswordButton);

    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
  });
});
