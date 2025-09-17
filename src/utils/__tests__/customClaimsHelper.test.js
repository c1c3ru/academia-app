import {
  refreshUserToken,
  getUserClaims,
  hasValidClaims,
  waitForClaimsUpdate,
  needsOnboarding,
  debugUserClaims
} from '../customClaimsHelper';
import { auth } from '../../services/firebase';

// Mock Firebase Auth
const mockGetIdToken = jest.fn();
const mockGetIdTokenResult = jest.fn();
const mockCurrentUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  getIdToken: mockGetIdToken,
  getIdTokenResult: mockGetIdTokenResult
};

jest.mock('../../services/firebase', () => ({
  auth: {
    currentUser: mockCurrentUser
  }
}));

describe('customClaimsHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.currentUser = mockCurrentUser;
  });

  describe('refreshUserToken', () => {
    it('should refresh user token successfully', async () => {
      mockGetIdToken.mockResolvedValue('new-token');

      const result = await refreshUserToken();

      expect(mockGetIdToken).toHaveBeenCalledWith(true);
      expect(result).toBe('new-token');
    });

    it('should return null when no user is logged in', async () => {
      auth.currentUser = null;

      const result = await refreshUserToken();

      expect(result).toBeNull();
    });

    it('should throw error when token refresh fails', async () => {
      mockGetIdToken.mockRejectedValue(new Error('Token refresh failed'));

      await expect(refreshUserToken()).rejects.toThrow('Token refresh failed');
    });
  });

  describe('getUserClaims', () => {
    it('should return user claims successfully', async () => {
      const mockClaims = {
        role: 'admin',
        academiaId: 'academia-123',
        iss: 'firebase',
        aud: 'project-id'
      };

      mockGetIdTokenResult.mockResolvedValue({
        claims: mockClaims
      });

      const result = await getUserClaims();

      expect(result).toEqual({
        role: 'admin',
        academiaId: 'academia-123',
        customClaims: mockClaims
      });
    });

    it('should return null values when claims are missing', async () => {
      mockGetIdTokenResult.mockResolvedValue({
        claims: { iss: 'firebase', aud: 'project-id' }
      });

      const result = await getUserClaims();

      expect(result).toEqual({
        role: null,
        academiaId: null,
        customClaims: { iss: 'firebase', aud: 'project-id' }
      });
    });

    it('should return null when no user is logged in', async () => {
      auth.currentUser = null;

      const result = await getUserClaims();

      expect(result).toBeNull();
    });
  });

  describe('hasValidClaims', () => {
    it('should return true for valid claims', async () => {
      mockGetIdTokenResult.mockResolvedValue({
        claims: {
          role: 'student',
          academiaId: 'academia-123'
        }
      });

      const result = await hasValidClaims();

      expect(result).toBe(true);
    });

    it('should return false when role is missing', async () => {
      mockGetIdTokenResult.mockResolvedValue({
        claims: {
          academiaId: 'academia-123'
        }
      });

      const result = await hasValidClaims();

      expect(result).toBe(false);
    });

    it('should return false when academiaId is missing', async () => {
      mockGetIdTokenResult.mockResolvedValue({
        claims: {
          role: 'student'
        }
      });

      const result = await hasValidClaims();

      expect(result).toBe(false);
    });

    it('should return false when no user is logged in', async () => {
      auth.currentUser = null;

      const result = await hasValidClaims();

      expect(result).toBe(false);
    });
  });

  describe('waitForClaimsUpdate', () => {
    it('should return claims when they match expected academiaId', async () => {
      mockGetIdToken.mockResolvedValue('token');
      mockGetIdTokenResult.mockResolvedValue({
        claims: {
          role: 'admin',
          academiaId: 'expected-academia'
        }
      });

      const result = await waitForClaimsUpdate('expected-academia', 2, 100);

      expect(result).toEqual({
        role: 'admin',
        academiaId: 'expected-academia',
        customClaims: expect.any(Object)
      });
    });

    it('should return null after max attempts', async () => {
      mockGetIdToken.mockResolvedValue('token');
      mockGetIdTokenResult.mockResolvedValue({
        claims: {
          role: 'admin',
          academiaId: 'different-academia'
        }
      });

      const result = await waitForClaimsUpdate('expected-academia', 2, 10);

      expect(result).toBeNull();
    });
  });

  describe('needsOnboarding', () => {
    it('should return false when user has valid claims', async () => {
      mockGetIdTokenResult.mockResolvedValue({
        claims: {
          role: 'student',
          academiaId: 'academia-123'
        }
      });

      const result = await needsOnboarding();

      expect(result).toBe(false);
    });

    it('should return true when user has invalid claims', async () => {
      mockGetIdTokenResult.mockResolvedValue({
        claims: {
          role: 'student'
          // Missing academiaId
        }
      });

      const result = await needsOnboarding();

      expect(result).toBe(true);
    });

    it('should return true when no user is logged in', async () => {
      auth.currentUser = null;

      const result = await needsOnboarding();

      expect(result).toBe(true);
    });

    it('should return true on error', async () => {
      mockGetIdTokenResult.mockRejectedValue(new Error('Claims error'));

      const result = await needsOnboarding();

      expect(result).toBe(true);
    });
  });

  describe('debugUserClaims', () => {
    it('should log user information when user is logged in', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      mockGetIdTokenResult.mockResolvedValue({
        claims: { role: 'admin', academiaId: 'academia-123' },
        authTime: '2024-01-01T00:00:00Z',
        issuedAtTime: '2024-01-01T00:00:00Z',
        expirationTime: '2024-01-01T01:00:00Z'
      });

      await debugUserClaims();

      expect(consoleSpy).toHaveBeenCalledWith(
        '🐛 debugUserClaims: Informações completas do usuário:',
        expect.objectContaining({
          uid: 'test-uid',
          email: 'test@example.com',
          claims: expect.any(Object)
        })
      );

      consoleSpy.mockRestore();
    });

    it('should log message when no user is logged in', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      auth.currentUser = null;

      await debugUserClaims();

      expect(consoleSpy).toHaveBeenCalledWith('🐛 debugUserClaims: Nenhum usuário logado');

      consoleSpy.mockRestore();
    });
  });
});
