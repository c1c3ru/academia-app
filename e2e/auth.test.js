const { device, expect, element, by, waitFor } = require('detox');

describe('Authentication Flow E2E', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Login Flow', () => {
    it('should display login screen on app launch', async () => {
      await waitFor(element(by.id('login-screen'))).toBeVisible().withTimeout(10000);
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
      await expect(element(by.id('login-button'))).toBeVisible();
    });

    it('should show validation errors for empty fields', async () => {
      await element(by.id('login-button')).tap();
      await waitFor(element(by.text('Email é obrigatório'))).toBeVisible().withTimeout(3000);
      await waitFor(element(by.text('Senha é obrigatória'))).toBeVisible().withTimeout(3000);
    });

    it('should show error for invalid email format', async () => {
      await element(by.id('email-input')).typeText('invalid-email');
      await element(by.id('login-button')).tap();
      await waitFor(element(by.text('Email inválido'))).toBeVisible().withTimeout(3000);
    });

    it('should successfully login admin user', async () => {
      await loginAsAdmin();
      await expect(element(by.id('admin-dashboard'))).toBeVisible();
      await expect(element(by.text('Olá, Admin!'))).toBeVisible();
    });

    it('should successfully login student user', async () => {
      await loginAsStudent();
      await expect(element(by.id('student-dashboard'))).toBeVisible();
      await expect(element(by.text('Meu Progresso'))).toBeVisible();
    });

    it('should successfully login instructor user', async () => {
      await loginAsInstructor();
      await expect(element(by.id('instructor-dashboard'))).toBeVisible();
      await expect(element(by.text('Minhas Turmas'))).toBeVisible();
    });
  });

  describe('Registration Flow', () => {
    it('should navigate to registration screen', async () => {
      await element(by.id('register-link')).tap();
      await waitFor(element(by.id('register-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.id('name-input'))).toBeVisible();
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
      await expect(element(by.id('confirm-password-input'))).toBeVisible();
    });

    it('should validate registration form', async () => {
      await element(by.id('register-link')).tap();
      await waitFor(element(by.id('register-screen'))).toBeVisible().withTimeout(5000);
      
      await element(by.id('register-button')).tap();
      await waitFor(element(by.text('Nome é obrigatório'))).toBeVisible().withTimeout(3000);
      await waitFor(element(by.text('Email é obrigatório'))).toBeVisible().withTimeout(3000);
      await waitFor(element(by.text('Senha é obrigatória'))).toBeVisible().withTimeout(3000);
    });

    it('should validate password confirmation', async () => {
      await element(by.id('register-link')).tap();
      await waitFor(element(by.id('register-screen'))).toBeVisible().withTimeout(5000);
      
      await fillForm({
        'name-input': 'Test User',
        'email-input': 'test@example.com',
        'password-input': 'password123',
        'confirm-password-input': 'different-password'
      });
      
      await element(by.id('register-button')).tap();
      await waitFor(element(by.text('Senhas não coincidem'))).toBeVisible().withTimeout(3000);
    });
  });

  describe('Logout Flow', () => {
    it('should logout admin user', async () => {
      await loginAsAdmin();
      await logout();
      await expect(element(by.id('login-screen'))).toBeVisible();
    });

    it('should logout student user', async () => {
      await loginAsStudent();
      await logout();
      await expect(element(by.id('login-screen'))).toBeVisible();
    });
  });

  describe('Password Reset Flow', () => {
    it('should navigate to forgot password screen', async () => {
      await element(by.id('forgot-password-link')).tap();
      await waitFor(element(by.id('forgot-password-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('reset-button'))).toBeVisible();
    });

    it('should validate email for password reset', async () => {
      await element(by.id('forgot-password-link')).tap();
      await waitFor(element(by.id('forgot-password-screen'))).toBeVisible().withTimeout(5000);
      
      await element(by.id('reset-button')).tap();
      await waitFor(element(by.text('Email é obrigatório'))).toBeVisible().withTimeout(3000);
    });
  });
});
