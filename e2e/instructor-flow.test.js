const { device, expect, element, by, waitFor } = require('detox');

describe('Instructor Flow E2E', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await loginAsInstructor();
  });

  afterEach(async () => {
    await logout();
  });

  describe('Dashboard Navigation', () => {
    it('should display instructor dashboard with all sections', async () => {
      await expect(element(by.id('instructor-dashboard'))).toBeVisible();
      await expect(element(by.text('Minhas Turmas'))).toBeVisible();
      await expect(element(by.text('Próximas Aulas'))).toBeVisible();
      await expect(element(by.text('Alunos'))).toBeVisible();
    });

    it('should navigate to classes screen', async () => {
      await element(by.id('classes-tab')).tap();
      await waitFor(element(by.id('instructor-classes-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Minhas Turmas'))).toBeVisible();
    });

    it('should navigate to students screen', async () => {
      await element(by.id('students-tab')).tap();
      await waitFor(element(by.id('instructor-students-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Meus Alunos'))).toBeVisible();
    });

    it('should navigate to evaluations screen', async () => {
      await element(by.id('evaluations-tab')).tap();
      await waitFor(element(by.id('evaluations-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Avaliações'))).toBeVisible();
    });
  });

  describe('Class Management', () => {
    beforeEach(async () => {
      await element(by.id('classes-tab')).tap();
      await waitFor(element(by.id('instructor-classes-screen'))).toBeVisible().withTimeout(5000);
    });

    it('should display instructor classes', async () => {
      await expect(element(by.id('classes-list'))).toBeVisible();
      await expect(element(by.id('add-class-fab'))).toBeVisible();
    });

    it('should create new class', async () => {
      await element(by.id('add-class-fab')).tap();
      await waitFor(element(by.id('create-class-screen'))).toBeVisible().withTimeout(5000);
      
      await fillForm({
        'class-name-input': 'Jiu-Jitsu Iniciante',
        'class-description-input': 'Turma para iniciantes no Jiu-Jitsu',
        'class-capacity-input': '20'
      });
      
      await element(by.id('modality-picker')).tap();
      await element(by.text('Jiu-Jitsu')).tap();
      
      await element(by.id('save-class-button')).tap();
      await expectToastMessage('Turma criada com sucesso!');
    });

    it('should view class details', async () => {
      await element(by.text('Jiu-Jitsu Básico')).tap();
      await waitFor(element(by.id('class-details-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Informações da Turma'))).toBeVisible();
      await expect(element(by.text('Alunos Matriculados'))).toBeVisible();
    });

    it('should manage class schedule', async () => {
      await element(by.text('Jiu-Jitsu Básico')).tap();
      await waitFor(element(by.id('class-details-screen'))).toBeVisible().withTimeout(5000);
      
      await element(by.id('edit-schedule-button')).tap();
      await waitFor(element(by.id('schedule-modal'))).toBeVisible().withTimeout(3000);
      
      await element(by.id('add-schedule-button')).tap();
      await element(by.text('Segunda-feira')).tap();
      await element(by.id('time-picker')).tap();
      await element(by.text('19:00')).tap();
      await element(by.id('save-schedule-button')).tap();
      
      await expectToastMessage('Horário adicionado com sucesso!');
    });
  });

  describe('Student Management', () => {
    beforeEach(async () => {
      await element(by.id('students-tab')).tap();
      await waitFor(element(by.id('instructor-students-screen'))).toBeVisible().withTimeout(5000);
    });

    it('should display instructor students', async () => {
      await expect(element(by.id('students-list'))).toBeVisible();
      await expect(element(by.text('Buscar alunos...'))).toBeVisible();
    });

    it('should search for students', async () => {
      await element(by.id('student-search')).typeText('João');
      await waitFor(element(by.text('João Silva'))).toBeVisible().withTimeout(3000);
    });

    it('should view student profile', async () => {
      await element(by.text('João Silva')).tap();
      await waitFor(element(by.id('student-profile-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Informações Pessoais'))).toBeVisible();
      await expect(element(by.text('Histórico de Graduações'))).toBeVisible();
    });

    it('should add graduation to student', async () => {
      await element(by.text('João Silva')).tap();
      await waitFor(element(by.id('student-profile-screen'))).toBeVisible().withTimeout(5000);
      
      await element(by.id('add-graduation-button')).tap();
      await waitFor(element(by.id('graduation-modal'))).toBeVisible().withTimeout(3000);
      
      await fillForm({
        'graduation-level-input': 'Faixa Azul',
        'graduation-date-input': '2024-01-15'
      });
      
      await element(by.id('save-graduation-button')).tap();
      await expectToastMessage('Graduação adicionada com sucesso!');
    });
  });

  describe('Evaluations Management', () => {
    beforeEach(async () => {
      await element(by.id('evaluations-tab')).tap();
      await waitFor(element(by.id('evaluations-screen'))).toBeVisible().withTimeout(5000);
    });

    it('should display evaluations screen', async () => {
      await expect(element(by.text('Avaliações'))).toBeVisible();
      await expect(element(by.id('create-evaluation-fab'))).toBeVisible();
    });

    it('should create new evaluation', async () => {
      await element(by.id('create-evaluation-fab')).tap();
      await waitFor(element(by.id('create-evaluation-screen'))).toBeVisible().withTimeout(5000);
      
      await element(by.id('student-picker')).tap();
      await element(by.text('João Silva')).tap();
      
      await fillForm({
        'technique-score-input': '8',
        'physical-score-input': '7',
        'discipline-score-input': '9',
        'evaluation-notes-input': 'Excelente progresso técnico'
      });
      
      await element(by.id('save-evaluation-button')).tap();
      await expectToastMessage('Avaliação criada com sucesso!');
    });

    it('should schedule evaluation', async () => {
      await element(by.id('schedule-evaluation-button')).tap();
      await waitFor(element(by.id('schedule-modal'))).toBeVisible().withTimeout(3000);
      
      await element(by.id('student-picker')).tap();
      await element(by.text('Maria Santos')).tap();
      
      await element(by.id('date-picker')).tap();
      await element(by.text('25')).tap(); // Select day 25
      
      await element(by.id('time-picker')).tap();
      await element(by.text('14:00')).tap();
      
      await element(by.id('schedule-button')).tap();
      await expectToastMessage('Avaliação agendada com sucesso!');
    });

    it('should view evaluation history', async () => {
      await expect(element(by.text('Histórico de Avaliações'))).toBeVisible();
      await element(by.text('Ver Detalhes')).atIndex(0).tap();
      
      await waitFor(element(by.id('evaluation-details-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Detalhes da Avaliação'))).toBeVisible();
    });
  });

  describe('Check-in Management', () => {
    it('should perform check-in for students', async () => {
      await element(by.id('checkin-quick-action')).tap();
      await waitFor(element(by.id('instructor-checkin-screen'))).toBeVisible().withTimeout(5000);
      
      await element(by.text('Check-in')).atIndex(0).tap(); // First student
      await expectToastMessage('Check-in realizado para o aluno');
    });

    it('should view check-in history', async () => {
      await element(by.id('checkin-quick-action')).tap();
      await waitFor(element(by.id('instructor-checkin-screen'))).toBeVisible().withTimeout(5000);
      
      await expect(element(by.text('Histórico de Check-ins'))).toBeVisible();
    });
  });

  describe('Calendar and Schedule', () => {
    it('should navigate to calendar', async () => {
      await element(by.id('calendar-tab')).tap();
      await waitFor(element(by.id('calendar-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Calendário de Aulas'))).toBeVisible();
    });

    it('should view daily schedule', async () => {
      await element(by.id('calendar-tab')).tap();
      await waitFor(element(by.id('calendar-screen'))).toBeVisible().withTimeout(5000);
      
      await element(by.text('15')).tap(); // Select day 15
      await waitFor(element(by.id('day-classes-list'))).toBeVisible().withTimeout(3000);
      await expect(element(by.text('aula')).atIndex(0)).toBeVisible();
    });
  });

  describe('Reports and Analytics', () => {
    it('should view class statistics', async () => {
      await element(by.id('reports-quick-action')).tap();
      await waitFor(element(by.id('instructor-reports-screen'))).toBeVisible().withTimeout(5000);
      
      await expect(element(by.text('Estatísticas das Turmas'))).toBeVisible();
      await expect(element(by.text('Frequência dos Alunos'))).toBeVisible();
    });

    it('should view student progress reports', async () => {
      await element(by.id('reports-quick-action')).tap();
      await waitFor(element(by.id('instructor-reports-screen'))).toBeVisible().withTimeout(5000);
      
      await element(by.text('Relatório de Progresso')).tap();
      await waitFor(element(by.id('progress-report-screen'))).toBeVisible().withTimeout(5000);
      await expect(element(by.text('Progresso dos Alunos'))).toBeVisible();
    });
  });
});
