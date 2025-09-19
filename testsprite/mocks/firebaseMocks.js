/**
 * TestSprite - Firebase Mocks
 * Mocks específicos para serviços Firebase do Academia App
 */

// Mock do academyFirestoreService
export const mockAcademyFirestoreService = {
  // Operações básicas
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  
  // Consultas
  getWhere: jest.fn(),
  getDocuments: jest.fn(),
  
  // Listeners
  onSnapshot: jest.fn(),
  
  // Batch operations
  batch: jest.fn(),
  
  // Reset all mocks
  resetMocks: () => {
    Object.values(mockAcademyFirestoreService).forEach(mock => {
      if (typeof mock === 'function' && mock.mockReset) {
        mock.mockReset();
      }
    });
  },
  
  // Setup default responses
  setupDefaults: () => {
    mockAcademyFirestoreService.create.mockResolvedValue('mock-id');
    mockAcademyFirestoreService.update.mockResolvedValue();
    mockAcademyFirestoreService.delete.mockResolvedValue();
    mockAcademyFirestoreService.get.mockResolvedValue(null);
    mockAcademyFirestoreService.getAll.mockResolvedValue([]);
    mockAcademyFirestoreService.getWhere.mockResolvedValue([]);
    mockAcademyFirestoreService.getDocuments.mockResolvedValue([]);
    mockAcademyFirestoreService.onSnapshot.mockReturnValue(() => {});
    mockAcademyFirestoreService.batch.mockResolvedValue();
  }
};

// Mock do academyClassService
export const mockAcademyClassService = {
  getClassesByInstructor: jest.fn(),
  getClassesByStudent: jest.fn(),
  getClassById: jest.fn(),
  createClass: jest.fn(),
  updateClass: jest.fn(),
  deleteClass: jest.fn(),
  
  resetMocks: () => {
    Object.values(mockAcademyClassService).forEach(mock => {
      if (typeof mock === 'function' && mock.mockReset) {
        mock.mockReset();
      }
    });
  },
  
  setupDefaults: () => {
    mockAcademyClassService.getClassesByInstructor.mockResolvedValue([]);
    mockAcademyClassService.getClassesByStudent.mockResolvedValue([]);
    mockAcademyClassService.getClassById.mockResolvedValue(null);
    mockAcademyClassService.createClass.mockResolvedValue('class-id');
    mockAcademyClassService.updateClass.mockResolvedValue();
    mockAcademyClassService.deleteClass.mockResolvedValue();
  }
};

// Mock do authService
export const mockAuthService = {
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  getCurrentUser: jest.fn(),
  updateProfile: jest.fn(),
  resetPassword: jest.fn(),
  
  resetMocks: () => {
    Object.values(mockAuthService).forEach(mock => {
      if (typeof mock === 'function' && mock.mockReset) {
        mock.mockReset();
      }
    });
  },
  
  setupDefaults: () => {
    mockAuthService.signIn.mockResolvedValue(TestSprite.mockAuthUser());
    mockAuthService.signUp.mockResolvedValue(TestSprite.mockAuthUser());
    mockAuthService.signOut.mockResolvedValue();
    mockAuthService.getCurrentUser.mockReturnValue(TestSprite.mockAuthUser());
    mockAuthService.updateProfile.mockResolvedValue();
    mockAuthService.resetPassword.mockResolvedValue();
  }
};

// Mock do notificationService
export const mockNotificationService = {
  scheduleNotification: jest.fn(),
  cancelNotification: jest.fn(),
  getPermissions: jest.fn(),
  requestPermissions: jest.fn(),
  
  resetMocks: () => {
    Object.values(mockNotificationService).forEach(mock => {
      if (typeof mock === 'function' && mock.mockReset) {
        mock.mockReset();
      }
    });
  },
  
  setupDefaults: () => {
    mockNotificationService.scheduleNotification.mockResolvedValue('notification-id');
    mockNotificationService.cancelNotification.mockResolvedValue();
    mockNotificationService.getPermissions.mockResolvedValue({ status: 'granted' });
    mockNotificationService.requestPermissions.mockResolvedValue({ status: 'granted' });
  }
};

// Função para resetar todos os mocks
export const resetAllMocks = () => {
  mockAcademyFirestoreService.resetMocks();
  mockAcademyClassService.resetMocks();
  mockAuthService.resetMocks();
  mockNotificationService.resetMocks();
};

// Função para configurar defaults em todos os mocks
export const setupAllDefaults = () => {
  mockAcademyFirestoreService.setupDefaults();
  mockAcademyClassService.setupDefaults();
  mockAuthService.setupDefaults();
  mockNotificationService.setupDefaults();
};

// Mock data generators
export const mockDataGenerators = {
  // Gerar dados de check-in
  generateCheckIn: (overrides = {}) => ({
    id: `checkin-${Date.now()}`,
    studentId: 'student-id',
    studentName: 'Test Student',
    classId: 'class-id',
    className: 'Test Class',
    instructorId: 'instructor-id',
    instructorName: 'Test Instructor',
    academiaId: 'academia-id',
    type: 'manual',
    date: new Date(),
    createdAt: new Date(),
    ...overrides
  }),
  
  // Gerar sessão de check-in
  generateCheckInSession: (overrides = {}) => ({
    id: `session-${Date.now()}`,
    classId: 'class-id',
    className: 'Test Class',
    instructorId: 'instructor-id',
    instructorName: 'Test Instructor',
    academiaId: 'academia-id',
    startTime: new Date(),
    status: 'active',
    checkInCount: 0,
    createdAt: new Date(),
    ...overrides
  }),
  
  // Gerar múltiplos check-ins
  generateMultipleCheckIns: (count = 5, overrides = {}) => {
    return Array.from({ length: count }, (_, index) => 
      mockDataGenerators.generateCheckIn({
        id: `checkin-${index}`,
        studentName: `Student ${index + 1}`,
        ...overrides
      })
    );
  },
  
  // Gerar múltiplas turmas
  generateMultipleClasses: (count = 3, overrides = {}) => {
    const modalities = ['Jiu-Jitsu', 'Muay Thai', 'Boxing', 'MMA'];
    return Array.from({ length: count }, (_, index) => 
      TestSprite.mockClass({
        id: `class-${index}`,
        name: `${modalities[index % modalities.length]} ${index + 1}`,
        modality: modalities[index % modalities.length],
        ...overrides
      })
    );
  }
};
