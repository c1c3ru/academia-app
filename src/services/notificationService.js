import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { firestoreService } from './firestoreService';

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Inicializar serviço de notificações
  async initialize() {
    try {
      await this.registerForPushNotificationsAsync();
      this.setupNotificationListeners();
      return true;
    } catch (error) {
      console.error('Erro ao inicializar notificações:', error);
      return false;
    }
  }

  // Registrar para notificações push
  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permissão para notificações negada');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
    } else {
      console.log('Deve usar um dispositivo físico para notificações push');
    }

    return token;
  }

  // Configurar listeners de notificações
  setupNotificationListeners() {
    // Listener para notificações recebidas
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificação recebida:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener para interações com notificações
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Resposta da notificação:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Manipular notificação recebida
  handleNotificationReceived(notification) {
    const { data } = notification.request.content;
    
    // Salvar notificação no Firestore
    if (data.userId) {
      this.saveNotificationToFirestore({
        userId: data.userId,
        title: notification.request.content.title,
        message: notification.request.content.body,
        type: data.type || 'general',
        data: data,
        isRead: false,
        createdAt: new Date()
      });
    }
  }

  // Manipular resposta da notificação
  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    // Navegar para tela específica baseada no tipo
    if (data.screen) {
      // Implementar navegação aqui
      console.log('Navegar para:', data.screen);
    }
  }

  // Salvar notificação no Firestore
  async saveNotificationToFirestore(notificationData) {
    try {
      await firestoreService.addDocument('notifications', notificationData);
    } catch (error) {
      console.error('Erro ao salvar notificação:', error);
    }
  }

  // Enviar notificação local
  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // Enviar imediatamente
      });
    } catch (error) {
      console.error('Erro ao enviar notificação local:', error);
    }
  }

  // Agendar notificação
  async scheduleNotification(title, body, triggerDate, data = {}) {
    try {
      const trigger = new Date(triggerDate);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger,
      });
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
    }
  }

  // Cancelar todas as notificações agendadas
  async cancelAllScheduledNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Erro ao cancelar notificações:', error);
    }
  }

  // Obter token push
  getExpoPushToken() {
    return this.expoPushToken;
  }

  // Limpar listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Notificações específicas do app
  async notifyPaymentDue(userId, amount, dueDate) {
    const title = 'Pagamento Pendente';
    const body = `Sua mensalidade de R$ ${amount.toFixed(2)} vence em ${new Date(dueDate).toLocaleDateString()}`;
    
    await this.saveNotificationToFirestore({
      userId,
      title,
      message: body,
      type: 'payment',
      data: { amount, dueDate },
      isRead: false,
      createdAt: new Date()
    });

    await this.sendLocalNotification(title, body, {
      type: 'payment',
      userId,
      screen: 'Pagamentos'
    });
  }

  async notifyClassReminder(userId, className, classTime) {
    const title = 'Lembrete de Aula';
    const body = `Sua aula de ${className} começa em 30 minutos (${classTime})`;
    
    await this.saveNotificationToFirestore({
      userId,
      title,
      message: body,
      type: 'class',
      data: { className, classTime },
      isRead: false,
      createdAt: new Date()
    });

    await this.sendLocalNotification(title, body, {
      type: 'class',
      userId,
      screen: 'Calendário'
    });
  }

  async notifyGraduation(userId, fromLevel, toLevel, modalityName) {
    const title = 'Parabéns! Nova Graduação';
    const body = `Você foi promovido de ${fromLevel} para ${toLevel} em ${modalityName}!`;
    
    await this.saveNotificationToFirestore({
      userId,
      title,
      message: body,
      type: 'graduation',
      data: { fromLevel, toLevel, modalityName },
      isRead: false,
      createdAt: new Date()
    });

    await this.sendLocalNotification(title, body, {
      type: 'graduation',
      userId,
      screen: 'Evolução'
    });
  }

  async notifyAnnouncement(userId, announcementTitle, announcementContent) {
    const title = 'Novo Anúncio';
    const body = announcementTitle;
    
    await this.saveNotificationToFirestore({
      userId,
      title,
      message: body,
      type: 'general',
      data: { announcementContent },
      isRead: false,
      createdAt: new Date()
    });

    await this.sendLocalNotification(title, body, {
      type: 'general',
      userId,
      screen: 'Dashboard'
    });
  }
}

export default new NotificationService();
