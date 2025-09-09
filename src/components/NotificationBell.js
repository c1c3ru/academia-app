import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { 
  IconButton, 
  Badge, 
  Portal, 
  Modal, 
  Card, 
  Title, 
  Paragraph, 
  Text,
  Button,
  Divider,
  List
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '../contexts/NotificationContext';

const NotificationBell = ({ color = '#fff', size = 24 }) => {
  const { 
    unreadNotifications, 
    unreadCount, 
    markNotificationAsRead, 
    loadUserNotifications,
    pushNotificationsEnabled,
    requestNotificationPermissions
  } = useNotification();
  
  const [modalVisible, setModalVisible] = useState(false);

  const handleNotificationPress = (notification) => {
    markNotificationAsRead(notification.id);
    // Aqui você pode adicionar navegação baseada no tipo da notificação
    if (notification.data?.screen) {
      // navigation.navigate(notification.data.screen);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment':
        return 'card-outline';
      case 'class':
        return 'school-outline';
      case 'graduation':
        return 'trophy-outline';
      case 'general':
        return 'information-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'payment':
        return '#f44336';
      case 'class':
        return '#2196f3';
      case 'graduation':
        return '#ff9800';
      case 'general':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const notificationDate = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d atrás`;
    }
  };

  return (
    <>
      <View style={styles.container}>
        <IconButton
          icon="notifications"
          iconColor={color}
          size={size}
          onPress={() => setModalVisible(true)}
        />
        {unreadCount > 0 && (
          <Badge style={styles.badge} size={16}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Title
              title="Notificações"
              subtitle={`${unreadCount} não lida${unreadCount !== 1 ? 's' : ''}`}
              left={(props) => <Ionicons name="notifications" size={24} color="#2196f3" />}
              right={(props) => (
                <IconButton
                  icon="close"
                  onPress={() => setModalVisible(false)}
                />
              )}
            />
            
            <Divider />
            
            {!pushNotificationsEnabled && (
              <Card.Content style={styles.permissionCard}>
                <View style={styles.permissionContent}>
                  <Ionicons name="notifications-off" size={32} color="#ff9800" />
                  <Text style={styles.permissionTitle}>
                    Notificações Desabilitadas
                  </Text>
                  <Text style={styles.permissionText}>
                    Ative as notificações para receber lembretes importantes
                  </Text>
                  <Button
                    mode="contained"
                    onPress={requestNotificationPermissions}
                    style={styles.permissionButton}
                  >
                    Ativar Notificações
                  </Button>
                </View>
              </Card.Content>
            )}

            <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
              {unreadNotifications.length === 0 ? (
                <Card.Content style={styles.emptyState}>
                  <Ionicons name="checkmark-circle" size={48} color="#4caf50" />
                  <Text style={styles.emptyText}>
                    Todas as notificações foram lidas!
                  </Text>
                </Card.Content>
              ) : (
                unreadNotifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    onPress={() => handleNotificationPress(notification)}
                    style={styles.notificationItem}
                  >
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <Ionicons
                          name={getNotificationIcon(notification.type)}
                          size={20}
                          color={getNotificationColor(notification.type)}
                        />
                        <Text style={styles.notificationTime}>
                          {formatDate(notification.createdAt)}
                        </Text>
                      </View>
                      
                      <Text style={styles.notificationTitle}>
                        {notification.title}
                      </Text>
                      
                      <Text style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                    </View>
                    
                    <View style={styles.unreadIndicator} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            {unreadNotifications.length > 0 && (
              <>
                <Divider />
                <Card.Actions>
                  <Button
                    onPress={() => {
                      loadUserNotifications();
                      setModalVisible(false);
                    }}
                  >
                    Atualizar
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => setModalVisible(false)}
                  >
                    Fechar
                  </Button>
                </Card.Actions>
              </>
            )}
          </Card>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#f44336',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: 20,
  },
  modalCard: {
    maxHeight: '80%',
    backgroundColor: '#fff',
  },
  permissionCard: {
    backgroundColor: '#fff3e0',
    margin: 16,
    borderRadius: 8,
  },
  permissionContent: {
    alignItems: 'center',
    padding: 16,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    color: '#ff9800',
  },
  permissionText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: '#ff9800',
  },
  notificationsList: {
    maxHeight: 400,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196f3',
    marginLeft: 8,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default NotificationBell;
