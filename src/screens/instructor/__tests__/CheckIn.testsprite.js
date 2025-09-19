/**
 * TestSprite - Testes para CheckIn Screen
 * Academia App - Tela de Check-in do Instrutor
 */

import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import CheckIn from '../CheckIn';

// Mock dos serviços
jest.mock('../../../services/academyFirestoreService', () => ({
  academyFirestoreService: {
    getWhere: jest.fn(),
    getDocuments: jest.fn(),
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  academyClassService: {
    getClassesByInstructor: jest.fn(),
  },
}));

// Mock do contexto de autenticação
jest.mock('../../../contexts/AuthProvider', () => ({
  useAuth: () => ({
    user: TestSprite.mockAuthUser(),
    userProfile: TestSprite.mockUserProfile({ role: 'instructor' }),
  }),
}));

// Mock da navegação
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

describe('TestSprite - CheckIn Screen', () => {
  const { academyFirestoreService, academyClassService } = require('../../../services/academyFirestoreService');
  
  beforeEach(() => {
    jest.clearAllMocks();
    Alert.alert = jest.fn();
  });

  const renderCheckIn = () => {
    return TestSprite.renderWithProviders(
      <CheckIn navigation={mockNavigation} />
    );
  };

  describe('Carregamento Inicial', () => {
    it('deve carregar as turmas do instrutor', async () => {
      const mockClasses = [
        TestSprite.mockClass({
          id: 'class-1',
          name: 'Jiu-Jitsu Iniciante',
          modality: 'Jiu-Jitsu',
          schedule: 'Segunda 19:00',
          maxStudents: 20,
          currentStudents: 15,
        }),
        TestSprite.mockClass({
          id: 'class-2',
          name: 'Muay Thai Avançado',
          modality: 'Muay Thai',
          schedule: 'Terça 20:00',
          maxStudents: 15,
          currentStudents: 10,
        }),
      ];

      academyClassService.getClassesByInstructor.mockResolvedValue(mockClasses);
      academyFirestoreService.getWhere.mockResolvedValue([]);
      academyFirestoreService.getDocuments.mockResolvedValue([]);
      academyFirestoreService.getAll.mockResolvedValue([]);

      const { getByText } = renderCheckIn();

      await waitFor(() => {
        expect(getByText('Minhas Turmas')).toBeTruthy();
      });

      await waitFor(() => {
        expect(getByText('Jiu-Jitsu Iniciante')).toBeTruthy();
        expect(getByText('Muay Thai Avançado')).toBeTruthy();
      });

      expect(academyClassService.getClassesByInstructor).toHaveBeenCalledWith(
        'test-user-id',
        'test-academia-id',
        'test@example.com'
      );
    });

    it('deve exibir estado vazio quando não há turmas', async () => {
      academyClassService.getClassesByInstructor.mockResolvedValue([]);
      academyFirestoreService.getWhere.mockResolvedValue([]);
      academyFirestoreService.getDocuments.mockResolvedValue([]);
      academyFirestoreService.getAll.mockResolvedValue([]);

      const { getByText } = renderCheckIn();

      await waitFor(() => {
        expect(getByText('Nenhuma turma encontrada')).toBeTruthy();
      });
    });
  });

  describe('Iniciar Check-in', () => {
    it('deve iniciar uma sessão de check-in para uma turma', async () => {
      const mockClass = TestSprite.mockClass({
        id: 'class-1',
        name: 'Jiu-Jitsu Iniciante',
      });

      academyClassService.getClassesByInstructor.mockResolvedValue([mockClass]);
      academyFirestoreService.getWhere.mockResolvedValue([]);
      academyFirestoreService.getDocuments.mockResolvedValue([]);
      academyFirestoreService.getAll.mockResolvedValue([]);
      academyFirestoreService.create.mockResolvedValue('session-id');

      const { getByText } = renderCheckIn();

      await waitFor(() => {
        expect(getByText('Jiu-Jitsu Iniciante')).toBeTruthy();
      });

      const startButton = getByText('Iniciar Check-in');
      fireEvent.press(startButton);

      await waitFor(() => {
        expect(academyFirestoreService.create).toHaveBeenCalledWith(
          'checkInSessions',
          expect.objectContaining({
            classId: 'class-1',
            className: 'Jiu-Jitsu Iniciante',
            instructorId: 'test-user-id',
            status: 'active',
            checkInCount: 0,
          }),
          'test-academia-id'
        );
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Sucesso',
        'Check-in iniciado para Jiu-Jitsu Iniciante'
      );
    });

    it('deve impedir iniciar check-in se já existe sessão ativa', async () => {
      const mockClass = TestSprite.mockClass({
        id: 'class-1',
        name: 'Jiu-Jitsu Iniciante',
      });

      const mockActiveSession = {
        id: 'session-1',
        classId: 'class-1',
        status: 'active',
      };

      academyClassService.getClassesByInstructor.mockResolvedValue([mockClass]);
      academyFirestoreService.getWhere.mockResolvedValue([mockActiveSession]);
      academyFirestoreService.getDocuments.mockResolvedValue([]);
      academyFirestoreService.getAll.mockResolvedValue([]);

      const { getByText } = renderCheckIn();

      await waitFor(() => {
        expect(getByText('Jiu-Jitsu Iniciante')).toBeTruthy();
      });

      const startButton = getByText('Iniciar Check-in');
      fireEvent.press(startButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Aviso',
        'Já existe uma sessão de check-in ativa para esta turma'
      );
    });
  });

  describe('Parar Check-in', () => {
    it('deve parar uma sessão de check-in ativa', async () => {
      const mockClass = TestSprite.mockClass({
        id: 'class-1',
        name: 'Jiu-Jitsu Iniciante',
      });

      const mockActiveSession = {
        id: 'session-1',
        classId: 'class-1',
        className: 'Jiu-Jitsu Iniciante',
        status: 'active',
        checkInCount: 5,
        startTime: { toDate: () => new Date() },
      };

      academyClassService.getClassesByInstructor.mockResolvedValue([mockClass]);
      academyFirestoreService.getWhere.mockResolvedValue([mockActiveSession]);
      academyFirestoreService.getDocuments.mockResolvedValue([]);
      academyFirestoreService.getAll.mockResolvedValue([]);
      academyFirestoreService.update.mockResolvedValue();

      const { getByText } = renderCheckIn();

      await waitFor(() => {
        expect(getByText('Sessões Ativas')).toBeTruthy();
        expect(getByText('Jiu-Jitsu Iniciante')).toBeTruthy();
      });

      const stopButton = getByText('Parar Check-in');
      fireEvent.press(stopButton);

      // Simular confirmação do Alert
      const alertCall = Alert.alert.mock.calls[0];
      const confirmCallback = alertCall[2][1].onPress;
      await confirmCallback();

      expect(academyFirestoreService.update).toHaveBeenCalledWith(
        'checkInSessions',
        'session-1',
        expect.objectContaining({
          status: 'completed',
          endTime: expect.any(Date),
        }),
        'test-academia-id'
      );
    });
  });

  describe('Check-in Manual', () => {
    it('deve abrir modal de check-in manual', async () => {
      const mockClass = TestSprite.mockClass();
      const mockStudents = [
        TestSprite.mockStudent({
          id: 'student-1',
          name: 'João Silva',
          email: 'joao@example.com',
        }),
      ];

      academyClassService.getClassesByInstructor.mockResolvedValue([mockClass]);
      academyFirestoreService.getWhere.mockResolvedValue([]);
      academyFirestoreService.getDocuments.mockResolvedValue([]);
      academyFirestoreService.getAll.mockResolvedValue(mockStudents);

      const { getByText, getByLabelText } = renderCheckIn();

      await waitFor(() => {
        expect(getByText('Minhas Turmas')).toBeTruthy();
      });

      const fabButton = getByText('Check-in Manual');
      fireEvent.press(fabButton);

      await waitFor(() => {
        expect(getByText('Check-in Manual')).toBeTruthy();
        expect(getByText('Selecione a turma:')).toBeTruthy();
      });
    });

    it('deve realizar check-in manual para um aluno', async () => {
      const mockClass = TestSprite.mockClass({
        id: 'class-1',
        name: 'Test Class',
      });
      
      const mockStudent = TestSprite.mockStudent({
        id: 'student-1',
        name: 'João Silva',
        email: 'joao@example.com',
      });

      academyClassService.getClassesByInstructor.mockResolvedValue([mockClass]);
      academyFirestoreService.getWhere.mockResolvedValue([]);
      academyFirestoreService.getDocuments.mockResolvedValue([]);
      academyFirestoreService.getAll.mockResolvedValue([mockStudent]);
      academyFirestoreService.create.mockResolvedValue('checkin-id');

      const { getByText, getByLabelText } = renderCheckIn();

      await waitFor(() => {
        expect(getByText('Minhas Turmas')).toBeTruthy();
      });

      // Abrir modal
      const fabButton = getByText('Check-in Manual');
      fireEvent.press(fabButton);

      await waitFor(() => {
        expect(getByText('Check-in Manual')).toBeTruthy();
      });

      // Selecionar turma
      const classChip = getByText('Test Class');
      fireEvent.press(classChip);

      // Fazer check-in do aluno
      const checkInButton = getByText('Check-in');
      fireEvent.press(checkInButton);

      await waitFor(() => {
        expect(academyFirestoreService.create).toHaveBeenCalledWith(
          'checkIns',
          expect.objectContaining({
            studentId: 'student-1',
            studentName: 'João Silva',
            classId: 'class-1',
            className: 'Test Class',
            type: 'manual',
          }),
          'test-academia-id'
        );
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Sucesso',
        'Check-in realizado para João Silva'
      );
    });
  });

  describe('Check-ins Recentes', () => {
    it('deve exibir check-ins do dia atual', async () => {
      const mockCheckIns = [
        {
          id: 'checkin-1',
          studentName: 'João Silva',
          className: 'Jiu-Jitsu Iniciante',
          type: 'manual',
          date: { toDate: () => new Date() },
        },
        {
          id: 'checkin-2',
          studentName: 'Maria Santos',
          className: 'Muay Thai',
          type: 'qrcode',
          date: { toDate: () => new Date() },
        },
      ];

      academyClassService.getClassesByInstructor.mockResolvedValue([]);
      academyFirestoreService.getWhere.mockResolvedValue([]);
      academyFirestoreService.getDocuments.mockResolvedValue(mockCheckIns);
      academyFirestoreService.getAll.mockResolvedValue([]);

      const { getByText } = renderCheckIn();

      await waitFor(() => {
        expect(getByText('Check-ins de Hoje')).toBeTruthy();
        expect(getByText('João Silva')).toBeTruthy();
        expect(getByText('Maria Santos')).toBeTruthy();
      });
    });

    it('deve exibir estado vazio quando não há check-ins', async () => {
      academyClassService.getClassesByInstructor.mockResolvedValue([]);
      academyFirestoreService.getWhere.mockResolvedValue([]);
      academyFirestoreService.getDocuments.mockResolvedValue([]);
      academyFirestoreService.getAll.mockResolvedValue([]);

      const { getByText } = renderCheckIn();

      await waitFor(() => {
        expect(getByText('Nenhum check-in hoje')).toBeTruthy();
      });
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve exibir erro quando falha ao carregar dados', async () => {
      academyClassService.getClassesByInstructor.mockRejectedValue(
        new Error('Erro de rede')
      );

      const { getByText } = renderCheckIn();

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Erro',
          'Não foi possível carregar os dados. Tente novamente.'
        );
      });
    });

    it('deve exibir erro quando falha ao iniciar check-in', async () => {
      const mockClass = TestSprite.mockClass();
      
      academyClassService.getClassesByInstructor.mockResolvedValue([mockClass]);
      academyFirestoreService.getWhere.mockResolvedValue([]);
      academyFirestoreService.getDocuments.mockResolvedValue([]);
      academyFirestoreService.getAll.mockResolvedValue([]);
      academyFirestoreService.create.mockRejectedValue(new Error('Erro ao criar'));

      const { getByText } = renderCheckIn();

      await waitFor(() => {
        expect(getByText('Test Class')).toBeTruthy();
      });

      const startButton = getByText('Iniciar Check-in');
      fireEvent.press(startButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Erro',
          'Não foi possível iniciar o check-in. Tente novamente.'
        );
      });
    });
  });

  describe('Refresh/Pull to Refresh', () => {
    it('deve carregar dados inicialmente', async () => {
      academyClassService.getClassesByInstructor.mockResolvedValue([]);
      academyFirestoreService.getWhere.mockResolvedValue([]);
      academyFirestoreService.getDocuments.mockResolvedValue([]);
      academyFirestoreService.getAll.mockResolvedValue([]);

      renderCheckIn();

      await waitFor(() => {
        expect(academyClassService.getClassesByInstructor).toHaveBeenCalledTimes(1);
      });
    });
  });
});
