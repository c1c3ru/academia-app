
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';
import { firestoreService } from '../services/firestoreService';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [pushToken, setPushToken] = useState(null);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const { user, userProfile } = useAuth();

  // Inicializar serviço de notificações
  useEffect(() => {
    initializeNotificationService();
    
    return () => {
      notificationService.cleanup();
    };
  }, []);

  // Carregar notificações do usuário quando logado
  useEffect(() => {
    if (user && userProfile) {
      loadUserNotifications();
      savePushTokenToFirestore();
    }
  }, [user, userProfile, pushToken]);

  const initializeNotificationService = async () => {
    try {
      const success = await notificationService.initialize();
      if (success) {
        const token = notificationService.getExpoPushToken();
        setPushToken(token);
        setPushNotificationsEnabled(true);
        console.log('✅ Serviço de notificações inicializado com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar notificações:', error);
      setPushNotificationsEnabled(false);
    }
  };

  const savePushTokenToFirestore = async () => {
    if (pushToken && user && userProfile?.academiaId) {
      try {
        await firestoreService.updateDocument(
          `academias/${userProfile.academiaId}/users`,
          user.uid,
          {
            pushToken,
            pushTokenUpdatedAt: new Date(),
            notificationsEnabled: true
          }
        );
        console.log('✅ Token push salvo no Firestore');
      } catch (error) {
        console.error('❌ Erro ao salvar token push:', error);
      }
    }
  };

  const loadUserNotifications = async () => {
    if (!user || !userProfile?.academiaId) return;

    try {
      console.log('📬 Carregando notificações para usuário:', user.uid);
      
      // Usar consulta simples com índice existente
      const userNotifications = await firestoreService.getDocuments(
        `academias/${userProfile.academiaId}/notifications`,
        [
          { field: 'userId', operator: '==', value: user.uid }
        ],
        { field: 'createdAt', direction: 'desc' },
        50 // Limitar quantidade para evitar problemas de performance
      );

      // Filtrar últimos 30 dias em memória
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentNotifications = userNotifications.filter(notification => {
        const createdAt = notification.createdAt?.seconds 
          ? new Date(notification.createdAt.seconds * 1000)
          : new Date(notification.createdAt);
        return createdAt >= thirtyDaysAgo;
      }).slice(0, 50); // Limitar a 50 mais recentes

      console.log(`📬 ${recentNotifications.length} notificações carregadas dos últimos 30 dias`);
      setUnreadNotifications(recentNotifications.filter(n => !n.isRead));
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
      // Em caso de erro, definir array vazio para evitar crash
      setUnreadNotifications([]);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    if (!userProfile?.academiaId) return;

    try {
      await firestoreService.updateDocument(
        `academias/${userProfile.academiaId}/notifications`,
        notificationId,
        { isRead: true, readAt: new Date() }
      );

      setUnreadNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!userProfile?.academiaId || unreadNotifications.length === 0) return;

    try {
      const batch = firestoreService.getBatch();
      
      unreadNotifications.forEach(notification => {
        const notificationRef = firestoreService.getDocumentRef(
          `academias/${userProfile.academiaId}/notifications`,
          notification.id
        );
        batch.update(notificationRef, { isRead: true, readAt: new Date() });
      });

      await batch.commit();
      setUnreadNotifications([]);
    } catch (error) {
      console.error('❌ Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  // Funções de notificação local (toast)
  const addNotification = (notification) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto remove após 5 segundos
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const showSuccess = (message) => {
    addNotification({ type: 'success', message });
  };

  const showError = (message) => {
    addNotification({ type: 'error', message });
  };

  const showWarning = (message) => {
    addNotification({ type: 'warning', message });
  };

  const showInfo = (message) => {
    addNotification({ type: 'info', message });
  };

  const sendPaymentReminder = async (amount, dueDate) => {
    if (!user || !pushNotificationsEnabled) return;
    
    try {
      await notificationService.notifyPaymentDue(user.uid, amount, dueDate);
      showSuccess('Lembrete de pagamento enviado');
    } catch (error) {
      console.error('❌ Erro ao enviar lembrete de pagamento:', error);
      showError('Erro ao enviar lembrete');
    }
  };

  const sendClassReminder = async (className, classTime) => {
    if (!user || !pushNotificationsEnabled) return;
    
    try {
      await notificationService.notifyClassReminder(user.uid, className, classTime);
      showSuccess('Lembrete de aula enviado');
    } catch (error) {
      console.error('❌ Erro ao enviar lembrete de aula:', error);
      showError('Erro ao enviar lembrete');
    }
  };

  const sendGraduationNotification = async (fromLevel, toLevel, modalityName) => {
    if (!user || !pushNotificationsEnabled) return;
    
    try {
      await notificationService.notifyGraduation(user.uid, fromLevel, toLevel, modalityName);
      showSuccess('Notificação de graduação enviada');
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de graduação:', error);
      showError('Erro ao enviar notificação');
    }
  };

  const sendAnnouncementNotification = async (title, content) => {
    if (!user || !pushNotificationsEnabled) return;
    
    try {
      await notificationService.notifyAnnouncement(user.uid, title, content);
      showSuccess('Anúncio enviado');
    } catch (error) {
      console.error('❌ Erro ao enviar anúncio:', error);
      showError('Erro ao enviar anúncio');
    }
  };

  const scheduleNotification = async (title, body, triggerDate, data = {}) => {
    if (!pushNotificationsEnabled) return;
    
    try {
      await notificationService.scheduleNotification(title, body, triggerDate, data);
      showSuccess('Notificação agendada');
    } catch (error) {
      console.error('❌ Erro ao agendar notificação:', error);
      showError('Erro ao agendar notificação');
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      const token = await notificationService.registerForPushNotificationsAsync();
      if (token) {
        setPushToken(token);
        setPushNotificationsEnabled(true);
        await savePushTokenToFirestore();
        showSuccess('Permissões de notificação concedidas');
        return true;
      } else {
        showWarning('Permissões de notificação negadas');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao solicitar permissões:', error);
      showError('Erro ao solicitar permissões');
      return false;
    }
  };

  const value = {
    // Toast notifications
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Push notifications
    pushToken,
    pushNotificationsEnabled,
    unreadNotifications,
    unreadCount: unreadNotifications.length,
    markNotificationAsRead,
    loadUserNotifications,
    
    // Notification actions
    sendPaymentReminder,
    sendClassReminder,
    sendGraduationNotification,
    sendAnnouncementNotification,
    scheduleNotification,
    requestNotificationPermissions,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de NotificationProvider');
  }
  return context;
};
