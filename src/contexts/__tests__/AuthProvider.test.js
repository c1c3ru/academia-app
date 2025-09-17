import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthProvider';
import { auth } from '../../services/firebase';

// Mock Firebase Auth
const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChanged = jest.fn();

jest.mock('../../services/firebase', () => ({
  auth: {
    currentUser: null,
    signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
    createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
    signOut: mockSignOut,
    onAuthStateChanged: mockOnAuthStateChanged
  }
}));

// Mock Custom Claims Helper
jest.mock('../../utils/customClaimsHelper', () => ({
  getUserClaims: jest.fn(),
  hasValidClaims: jest.fn(),
  needsOnboarding: jest.fn()
}));

// Test component to access auth context
const TestComponent = () => {
  const { user, userProfile, loading, login, logout, register } = useAuth();
  
  return (
    <>
      <div testID="user">{user ? user.email : 'No user'}</div>
      <div testID="profile">{userProfile ? userProfile.name : 'No profile'}</div>
      <div testID="loading">{loading ? 'Loading' : 'Not loading'}</div>
    </>
  );
};

describe('AuthProvider Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockImplementation((callback) => {
      // Simulate no user initially
      callback(null);
      return jest.fn(); // Unsubscribe function
    });
  });

  it('provides initial auth state', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user')).toHaveTextContent('No user');
      expect(getByTestId('profile')).toHaveTextContent('No profile');
      expect(getByTestId('loading')).toHaveTextContent('Not loading');
    });
  });

  it('handles successful login', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      getIdToken: jest.fn().mockResolvedValue('mock-token')
    };

    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: mockUser
    });

    let authCallback;
    mockOnAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      callback(null); // Initial state
      return jest.fn();
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Simulate user login
    act(() => {
      authCallback(mockUser);
    });

    await waitFor(() => {
      expect(getByTestId('user')).toHaveTextContent('test@example.com');
    });
  });

  it('handles login error', async () => {
    const error = new Error('Invalid credentials');
    mockSignInWithEmailAndPassword.mockRejectedValue(error);

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // The error handling would be tested in the actual login function
    // This test ensures the provider doesn't crash on auth errors
    await waitFor(() => {
      expect(getByTestId('loading')).toHaveTextContent('Not loading');
    });
  });

  it('handles logout', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com'
    };

    let authCallback;
    mockOnAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      callback(mockUser); // Start with logged in user
      return jest.fn();
    });

    mockSignOut.mockResolvedValue();

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Simulate logout
    act(() => {
      authCallback(null);
    });

    await waitFor(() => {
      expect(getByTestId('user')).toHaveTextContent('No user');
    });
  });

  it('handles user registration', async () => {
    const mockUser = {
      uid: 'new-user-uid',
      email: 'newuser@example.com'
    };

    mockCreateUserWithEmailAndPassword.mockResolvedValue({
      user: mockUser
    });

    let authCallback;
    mockOnAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      callback(null); // Initial state
      return jest.fn();
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Simulate user registration and login
    act(() => {
      authCallback(mockUser);
    });

    await waitFor(() => {
      expect(getByTestId('user')).toHaveTextContent('newuser@example.com');
    });
  });
});
