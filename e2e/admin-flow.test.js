const { device, expect, element, by, waitFor } = require('detox');

describe('Admin Flow E2E', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await loginAsAdmin();
  });

  afterEach(async () => {
    await logout();
  });

  describe('Dashboard Navigation', () => {
    it('should display admin dashboard with all sections', async () => {
      await expect(element(by.id('admin-dashboard'))).toBeVisible();
      await expect(element(by.text('Estatísticas Principais'))).toBeVisible();
      await expect(element(by.text('Ações Rápidas'))).toBeVisible();
      await expect(element(by.text('Alertas'))).toBeVisible();
    });

    it('should navigate to student management', async () => {
      await element(by.id('students-quick-action')).tap();
      await waitFor(element(by.id('admin-students-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Buscar alunos...'))).toBeVisible();
    });

    it('should navigate to class management', async () => {
      await element(by.id('classes-quick-action')).tap();
      await waitFor(element(by.id('admin-classes-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Turmas'))).toBeVisible();
    });

    it('should navigate to financial management', async () => {
      await element(by.id('payments-quick-action')).tap();
      await waitFor(element(by.id('admin-payments-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Pagamentos'))).toBeVisible();
    });
  });

  describe('Student Management', () => {
    beforeEach(async () => {
      await element(by.id('students-quick-action')).tap();
      await waitFor(element(by.id('admin-students-screen'))).toBeVisible().withTimeout(5000);
    });

    it('should display student list', async () => {
      await waitFor(element(by.id('student-list'))).toBeVisible().withTimeout(5000);
      await expect(element(by.id('add-student-fab'))).toBeVisible();
    });

    it('should search for students', async () => {
      await element(by.id('student-search')).typeText('João');
      await waitFor(element(by.text('João Silva'))).toBeVisible().withTimeout(3000);
    });

    it('should filter students by status', async () => {
      await element(by.id('filter-button')).tap();
      await element(by.text('Ativos')).tap();
      await waitFor(element(by.id('student-list'))).toBeVisible().withTimeout(3000);
    });

    it('should add new student', async () => {
      await element(by.id('add-student-fab')).tap();
      await waitFor(element(by.id('add-student-screen'))).toBeVisible().withTimeout(5000);
      
      await fillForm({
        'student-name-input': 'Novo Aluno',
        'student-email-input': 'novo@test.com',
        'student-phone-input': '11999999999'
      });
      
      await element(by.id('save-student-button')).tap();
      await expectToastMessage('Aluno cadastrado com sucesso!');
    });

    it('should view student details', async () => {
      await element(by.text('João Silva')).tap();
      await waitFor(element(by.id('student-details-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Informações Pessoais'))).toBeVisible();
      await expect(element(by.text('Turmas Matriculadas'))).toBeVisible();
    });
  });

  describe('Modalities Management', () => {
    beforeEach(async () => {
      await element(by.id('modalities-quick-action')).tap();
      await waitFor(element(by.id('admin-modalities-screen'))).toBeVisible().withTimeout(5000);
    });

    it('should display modalities list', async () => {
      await expect(element(by.text('Modalidades de Luta'))).toBeVisible();
      await expect(element(by.id('add-modality-button'))).toBeVisible();
    });

    it('should add new modality', async () => {
      await element(by.id('add-modality-button')).tap();
      await waitFor(element(by.id('modality-dialog'))).toBeVisible().withTimeout(3000);
      
      await element(by.id('modality-name-input')).typeText('Karatê');
      await element(by.id('modality-description-input')).typeText('Arte marcial japonesa');
      await element(by.id('create-modality-button')).tap();
      
      await expectToastMessage('Modalidade criada com sucesso!');
    });

    it('should edit existing modality', async () => {
      await element(by.text('Editar')).atIndex(0).tap();
      await waitFor(element(by.id('modality-dialog'))).toBeVisible().withTimeout(3000);
      
      await element(by.id('modality-name-input')).clearText();
      await element(by.id('modality-name-input')).typeText('Jiu-Jitsu Brasileiro');
      await element(by.id('update-modality-button')).tap();
      
      await expectToastMessage('Modalidade atualizada com sucesso!');
    });

    it('should delete modality', async () => {
      await element(by.text('Excluir')).atIndex(0).tap();
      await waitFor(element(by.text('Confirmar Exclusão'))).toBeVisible().withTimeout(3000);
      await element(by.text('Excluir')).tap();
      
      await expectToastMessage('Modalidade excluída com sucesso!');
    });
  });

  describe('Payment Plans Management', () => {
    beforeEach(async () => {
      await element(by.id('modalities-quick-action')).tap();
      await waitFor(element(by.id('admin-modalities-screen'))).toBeVisible().withTimeout(5000);
    });

    it('should display payment plans section', async () => {
      await expect(element(by.text('Planos de Pagamento'))).toBeVisible();
    });

    it('should add new payment plan', async () => {
      await element(by.text('Adicionar')).atIndex(1).tap(); // Second add button (for plans)
      await waitFor(element(by.id('plan-dialog'))).toBeVisible().withTimeout(3000);
      
      await fillForm({
        'plan-name-input': 'Plano Mensal',
        'plan-value-input': '150',
        'plan-duration-input': '1',
        'plan-description-input': 'Plano mensal básico'
      });
      
      await element(by.id('create-plan-button')).tap();
      await expectToastMessage('Plano criado com sucesso!');
    });
  });

  describe('QR Code Generation', () => {
    it('should generate and display QR code', async () => {
      await element(by.id('qr-code-button')).tap();
      await waitFor(element(by.id('qr-code-modal'))).toBeVisible().withTimeout(3000);
      await expect(element(by.id('qr-code-image'))).toBeVisible();
      await expect(element(by.text('Compartilhar'))).toBeVisible();
      await expect(element(by.text('Salvar'))).toBeVisible();
    });

    it('should close QR code modal', async () => {
      await element(by.id('qr-code-button')).tap();
      await waitFor(element(by.id('qr-code-modal'))).toBeVisible().withTimeout(3000);
      await element(by.id('close-qr-modal')).tap();
      await waitFor(element(by.id('qr-code-modal'))).not.toBeVisible().withTimeout(3000);
    });
  });

  describe('Reports and Analytics', () => {
    it('should navigate to reports screen', async () => {
      await element(by.id('reports-quick-action')).tap();
      await waitFor(element(by.id('reports-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Relatórios Gerenciais'))).toBeVisible();
    });

    it('should display financial statistics', async () => {
      await element(by.id('reports-quick-action')).tap();
      await waitFor(element(by.id('reports-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Estatísticas Principais'))).toBeVisible();
      await expect(element(by.text('Receita Mensal'))).toBeVisible();
    });
  });
});
