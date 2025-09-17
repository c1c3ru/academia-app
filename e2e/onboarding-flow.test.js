const { device, expect, element, by, waitFor } = require('detox');

describe('Onboarding Flow E2E', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Academy Creation Flow', () => {
    it('should display onboarding screen for new users', async () => {
      // Simulate new user without academy
      await element(by.id('register-link')).tap();
      await waitFor(element(by.id('register-screen'))).toBeVisible().withTimeout(5000);
      
      await fillForm({
        'name-input': 'New Admin',
        'email-input': 'newadmin@test.com',
        'password-input': 'password123',
        'confirm-password-input': 'password123'
      });
      
      await element(by.id('register-button')).tap();
      await waitFor(element(by.id('onboarding-screen'))).toBeVisible().withTimeout(10000);
    });

    it('should create new academy', async () => {
      // Navigate to onboarding
      await element(by.id('register-link')).tap();
      await waitFor(element(by.id('register-screen'))).toBeVisible().withTimeout(5000);
      
      await fillForm({
        'name-input': 'New Admin',
        'email-input': 'newadmin@test.com',
        'password-input': 'password123',
        'confirm-password-input': 'password123'
      });
      
      await element(by.id('register-button')).tap();
      await waitFor(element(by.id('onboarding-screen'))).toBeVisible().withTimeout(10000);
      
      // Create academy
      await element(by.text('Criar Academia')).tap();
      await waitFor(element(by.id('create-academy-modal'))).toBeVisible().withTimeout(3000);
      
      await fillForm({
        'academy-name-input': 'Nova Academia',
        'academy-description-input': 'Academia de artes marciais',
        'academy-address-input': 'Rua das Flores, 123',
        'academy-phone-input': '11999999999',
        'academy-email-input': 'contato@novaacademia.com'
      });
      
      await element(by.id('create-academy-button')).tap();
      await expectToastMessage('Academia criada com sucesso!');
      
      // Should navigate to admin dashboard
      await waitFor(element(by.id('admin-dashboard'))).toBeVisible().withTimeout(10000);
    });

    it('should use invite code', async () => {
      // Navigate to onboarding
      await element(by.id('register-link')).tap();
      await waitFor(element(by.id('register-screen'))).toBeVisible().withTimeout(5000);
      
      await fillForm({
        'name-input': 'New Student',
        'email-input': 'newstudent@test.com',
        'password-input': 'password123',
        'confirm-password-input': 'password123'
      });
      
      await element(by.id('register-button')).tap();
      await waitFor(element(by.id('onboarding-screen'))).toBeVisible().withTimeout(10000);
      
      // Use invite code
      await element(by.text('Usar Convite')).tap();
      await waitFor(element(by.id('invite-modal'))).toBeVisible().withTimeout(3000);
      
      await element(by.id('invite-code-input')).typeText('TEST123');
      await element(by.id('use-invite-button')).tap();
      
      await expectToastMessage('Você foi associado à academia');
      
      // Should navigate to appropriate dashboard based on role
      await waitFor(element(by.id('student-dashboard'))).toBeVisible().withTimeout(10000);
    });

    it('should validate academy creation form', async () => {
      // Navigate to onboarding and try to create academy without required fields
      await element(by.id('register-link')).tap();
      await waitFor(element(by.id('register-screen'))).toBeVisible().withTimeout(5000);
      
      await fillForm({
        'name-input': 'New Admin',
        'email-input': 'newadmin@test.com',
        'password-input': 'password123',
        'confirm-password-input': 'password123'
      });
      
      await element(by.id('register-button')).tap();
      await waitFor(element(by.id('onboarding-screen'))).toBeVisible().withTimeout(10000);
      
      await element(by.text('Criar Academia')).tap();
      await waitFor(element(by.id('create-academy-modal'))).toBeVisible().withTimeout(3000);
      
      await element(by.id('create-academy-button')).tap();
      await waitFor(element(by.text('Nome da academia é obrigatório'))).toBeVisible().withTimeout(3000);
    });

    it('should validate invite code', async () => {
      // Navigate to onboarding and try invalid invite code
      await element(by.id('register-link')).tap();
      await waitFor(element(by.id('register-screen'))).toBeVisible().withTimeout(5000);
      
      await fillForm({
        'name-input': 'New Student',
        'email-input': 'newstudent@test.com',
        'password-input': 'password123',
        'confirm-password-input': 'password123'
      });
      
      await element(by.id('register-button')).tap();
      await waitFor(element(by.id('onboarding-screen'))).toBeVisible().withTimeout(10000);
      
      await element(by.text('Usar Convite')).tap();
      await waitFor(element(by.id('invite-modal'))).toBeVisible().withTimeout(3000);
      
      await element(by.id('invite-code-input')).typeText('INVALID');
      await element(by.id('use-invite-button')).tap();
      
      await waitFor(element(by.text('Código de convite inválido'))).toBeVisible().withTimeout(3000);
    });
  });

  describe('Role-based Navigation', () => {
    it('should redirect admin to admin dashboard after onboarding', async () => {
      // Complete academy creation flow
      await element(by.id('register-link')).tap();
      await waitFor(element(by.id('register-screen'))).toBeVisible().withTimeout(5000);
      
      await fillForm({
        'name-input': 'Admin User',
        'email-input': 'admin@test.com',
        'password-input': 'password123',
        'confirm-password-input': 'password123'
      });
      
      await element(by.id('register-button')).tap();
      await waitFor(element(by.id('onboarding-screen'))).toBeVisible().withTimeout(10000);
      
      await element(by.text('Criar Academia')).tap();
      await waitFor(element(by.id('create-academy-modal'))).toBeVisible().withTimeout(3000);
      
      await element(by.id('academy-name-input')).typeText('Test Academy');
      await element(by.id('create-academy-button')).tap();
      
      await waitFor(element(by.id('admin-dashboard'))).toBeVisible().withTimeout(10000);
      await expect(element(by.text('Estatísticas Principais'))).toBeVisible();
    });

    it('should redirect student to student dashboard after using invite', async () => {
      // Complete invite code flow as student
      await element(by.id('register-link')).tap();
      await waitFor(element(by.id('register-screen'))).toBeVisible().withTimeout(5000);
      
      await fillForm({
        'name-input': 'Student User',
        'email-input': 'student@test.com',
        'password-input': 'password123',
        'confirm-password-input': 'password123'
      });
      
      await element(by.id('register-button')).tap();
      await waitFor(element(by.id('onboarding-screen'))).toBeVisible().withTimeout(10000);
      
      await element(by.text('Usar Convite')).tap();
      await waitFor(element(by.id('invite-modal'))).toBeVisible().withTimeout(3000);
      
      await element(by.id('invite-code-input')).typeText('STUDENT123');
      await element(by.id('use-invite-button')).tap();
      
      await waitFor(element(by.id('student-dashboard'))).toBeVisible().withTimeout(10000);
      await expect(element(by.text('Meu Progresso'))).toBeVisible();
    });

    it('should redirect instructor to instructor dashboard after using invite', async () => {
      // Complete invite code flow as instructor
      await element(by.id('register-link')).tap();
      await waitFor(element(by.id('register-screen'))).toBeVisible().withTimeout(5000);
      
      await fillForm({
        'name-input': 'Instructor User',
        'email-input': 'instructor@test.com',
        'password-input': 'password123',
        'confirm-password-input': 'password123'
      });
      
      await element(by.id('register-button')).tap();
      await waitFor(element(by.id('onboarding-screen'))).toBeVisible().withTimeout(10000);
      
      await element(by.text('Usar Convite')).tap();
      await waitFor(element(by.id('invite-modal'))).toBeVisible().withTimeout(3000);
      
      await element(by.id('invite-code-input')).typeText('INSTRUCTOR123');
      await element(by.id('use-invite-button')).tap();
      
      await waitFor(element(by.id('instructor-dashboard'))).toBeVisible().withTimeout(10000);
      await expect(element(by.text('Minhas Turmas'))).toBeVisible();
    });
  });
});
