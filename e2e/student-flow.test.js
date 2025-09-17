const { device, expect, element, by, waitFor } = require('detox');

describe('Student Flow E2E', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await loginAsStudent();
  });

  afterEach(async () => {
    await logout();
  });

  describe('Dashboard Navigation', () => {
    it('should display student dashboard with all sections', async () => {
      await expect(element(by.id('student-dashboard'))).toBeVisible();
      await expect(element(by.text('Meu Progresso'))).toBeVisible();
      await expect(element(by.text('Próximas Aulas'))).toBeVisible();
      await expect(element(by.text('Avisos'))).toBeVisible();
    });

    it('should navigate to calendar screen', async () => {
      await element(by.id('calendar-tab')).tap();
      await waitFor(element(by.id('calendar-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Calendário de Aulas'))).toBeVisible();
    });

    it('should navigate to check-in screen', async () => {
      await element(by.id('checkin-tab')).tap();
      await waitFor(element(by.id('checkin-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Check-in'))).toBeVisible();
    });

    it('should navigate to payments screen', async () => {
      await element(by.id('payments-tab')).tap();
      await waitFor(element(by.id('payments-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Pagamentos'))).toBeVisible();
    });
  });

  describe('Check-in Flow', () => {
    beforeEach(async () => {
      await element(by.id('checkin-tab')).tap();
      await waitFor(element(by.id('checkin-screen'))).toBeVisible().withTimeout(5000);
    });

    it('should display check-in status', async () => {
      await expect(element(by.text('Aguardando Check-in'))).toBeVisible();
      await expect(element(by.id('general-checkin-fab'))).toBeVisible();
    });

    it('should perform general check-in', async () => {
      await element(by.id('general-checkin-fab')).tap();
      await expectToastMessage('Check-in realizado!');
      await expect(element(by.text('Check-in Realizado'))).toBeVisible();
    });

    it('should perform class check-in', async () => {
      await element(by.text('Check-in')).atIndex(0).tap(); // First class check-in button
      await expectToastMessage('Check-in na aula');
      await expect(element(by.text('Check-in Realizado'))).toBeVisible();
    });

    it('should display check-in history', async () => {
      await expect(element(by.text('Últimos Check-ins'))).toBeVisible();
    });
  });

  describe('Calendar and Classes', () => {
    beforeEach(async () => {
      await element(by.id('calendar-tab')).tap();
      await waitFor(element(by.id('calendar-screen'))).toBeVisible().withTimeout(5000);
    });

    it('should display calendar with classes', async () => {
      await expect(element(by.id('calendar-component'))).toBeVisible();
      await expect(element(by.text('Calendário de Aulas'))).toBeVisible();
    });

    it('should select a date and show classes', async () => {
      await element(by.text('15')).tap(); // Tap on day 15
      await waitFor(element(by.id('day-classes-list'))).toBeVisible().withTimeout(3000);
    });

    it('should view class details', async () => {
      await element(by.text('Detalhes')).atIndex(0).tap();
      await waitFor(element(by.id('class-details-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Informações da Turma'))).toBeVisible();
    });

    it('should schedule class reminder', async () => {
      await element(by.text('Lembrete')).atIndex(0).tap();
      await expectToastMessage('Lembretes agendados com sucesso!');
    });
  });

  describe('Payment Management', () => {
    beforeEach(async () => {
      await element(by.id('payments-tab')).tap();
      await waitFor(element(by.id('payments-screen'))).toBeVisible().withTimeout(5000);
    });

    it('should display current plan', async () => {
      await expect(element(by.text('Plano Atual'))).toBeVisible();
      await expect(element(by.text('Ativo'))).toBeVisible();
    });

    it('should display payment history', async () => {
      await expect(element(by.text('Histórico de Pagamentos'))).toBeVisible();
    });

    it('should select new plan', async () => {
      await element(by.id('select-plan-fab')).tap();
      await waitFor(element(by.id('plan-selection-modal'))).toBeVisible().withTimeout(3000);
      
      await element(by.text('Plano Mensal')).tap();
      await element(by.id('confirm-plan-button')).tap();
      
      await expectToastMessage('Plano selecionado com sucesso');
    });

    it('should process payment', async () => {
      await element(by.text('Pagar')).atIndex(0).tap();
      await waitFor(element(by.text('Confirmar pagamento'))).toBeVisible().withTimeout(3000);
      await element(by.text('Confirmar')).tap();
      
      await expectToastMessage('Pagamento realizado com sucesso!');
    });
  });

  describe('Profile Management', () => {
    beforeEach(async () => {
      await element(by.id('profile-tab')).tap();
      await waitFor(element(by.id('profile-screen'))).toBeVisible().withTimeout(5000);
    });

    it('should display profile information', async () => {
      await expect(element(by.text('Informações Pessoais'))).toBeVisible();
      await expect(element(by.text('Turmas Matriculadas'))).toBeVisible();
      await expect(element(by.text('Histórico de Graduações'))).toBeVisible();
    });

    it('should edit profile information', async () => {
      await element(by.id('edit-profile-button')).tap();
      await waitFor(element(by.id('edit-profile-screen'))).toBeVisible().withTimeout(5000);
      
      await element(by.id('phone-input')).clearText();
      await element(by.id('phone-input')).typeText('11987654321');
      await element(by.id('save-profile-button')).tap();
      
      await expectToastMessage('Perfil atualizado com sucesso!');
    });

    it('should view graduation history', async () => {
      await expect(element(by.text('Histórico de Graduações'))).toBeVisible();
      await expect(element(by.text('Faixa Branca'))).toBeVisible();
    });
  });

  describe('Notifications', () => {
    it('should display announcements on dashboard', async () => {
      await expect(element(by.text('Avisos'))).toBeVisible();
    });

    it('should view announcement details', async () => {
      await element(by.text('Ver Mais')).atIndex(0).tap();
      await waitFor(element(by.id('announcement-modal'))).toBeVisible().withTimeout(3000);
      await expect(element(by.text('Fechar'))).toBeVisible();
    });
  });

  describe('Progress Tracking', () => {
    it('should display progress statistics', async () => {
      await expect(element(by.text('Meu Progresso'))).toBeVisible();
      await expect(element(by.text('Check-ins este mês'))).toBeVisible();
      await expect(element(by.text('Aulas frequentadas'))).toBeVisible();
    });

    it('should show upcoming classes', async () => {
      await expect(element(by.text('Próximas Aulas'))).toBeVisible();
    });
  });
});
