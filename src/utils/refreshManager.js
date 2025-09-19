/**
 * Sistema de refresh global para sincronizar dados entre telas
 */

class RefreshManager {
  constructor() {
    this.listeners = new Map();
  }

  // Registrar listener para uma tela específica
  subscribe(screenName, callback) {
    if (!this.listeners.has(screenName)) {
      this.listeners.set(screenName, new Set());
    }
    this.listeners.get(screenName).add(callback);

    // Retornar função para unsubscribe
    return () => {
      const screenListeners = this.listeners.get(screenName);
      if (screenListeners) {
        screenListeners.delete(callback);
        if (screenListeners.size === 0) {
          this.listeners.delete(screenName);
        }
      }
    };
  }

  // Notificar todas as telas registradas para um tipo de dados
  notifyRefresh(dataType, data = null) {
    console.log(`🔄 RefreshManager: Notificando refresh para ${dataType}`);
    
    // Mapear tipos de dados para telas que devem ser atualizadas
    const screenMappings = {
      'students': ['AdminStudents', 'InstructorStudents', 'CheckIn'],
      'classes': ['AdminClasses', 'InstructorClasses', 'CheckIn'],
      'payments': ['AdminStudents', 'Reports'],
      'graduations': ['AdminStudents', 'StudentProfile']
    };

    const screensToRefresh = screenMappings[dataType] || [];
    
    screensToRefresh.forEach(screenName => {
      const screenListeners = this.listeners.get(screenName);
      if (screenListeners) {
        screenListeners.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`❌ Erro ao executar callback de refresh para ${screenName}:`, error);
          }
        });
      }
    });
  }

  // Métodos específicos para cada tipo de dados
  refreshStudents(studentData = null) {
    this.notifyRefresh('students', studentData);
  }

  refreshClasses(classData = null) {
    this.notifyRefresh('classes', classData);
  }

  refreshPayments(paymentData = null) {
    this.notifyRefresh('payments', paymentData);
  }

  refreshGraduations(graduationData = null) {
    this.notifyRefresh('graduations', graduationData);
  }
}

// Instância singleton
export const refreshManager = new RefreshManager();

// Hook para usar o refresh manager
export const useRefreshManager = (screenName, callback) => {
  const [isSubscribed, setIsSubscribed] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = refreshManager.subscribe(screenName, callback);
    setIsSubscribed(true);

    return () => {
      unsubscribe();
      setIsSubscribed(false);
    };
  }, [screenName, callback]);

  return isSubscribed;
};
