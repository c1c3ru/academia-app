import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Snackbar, Portal } from 'react-native-paper';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now().toString();
    const notification = {
      id,
      message,
      type,
      duration,
      visible: true
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-hide após a duração especificada
    setTimeout(() => {
      hideNotification(id);
    }, duration);

    return id;
  }, []);

  const hideNotification = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, visible: false }
          : notification
      )
    );

    // Remove da lista após a animação
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 300);
  }, []);

  const showSuccess = useCallback((message, duration) => {
    return showNotification(message, 'success', duration);
  }, [showNotification]);

  const showError = useCallback((message, duration) => {
    return showNotification(message, 'error', duration);
  }, [showNotification]);

  const showWarning = useCallback((message, duration) => {
    return showNotification(message, 'warning', duration);
  }, [showNotification]);

  const showInfo = useCallback((message, duration) => {
    return showNotification(message, 'info', duration);
  }, [showNotification]);

  const getSnackbarColor = (type) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      case 'info': 
      default: return '#2196F3';
    }
  };

  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Portal>
        <View style={styles.container}>
          {notifications.map((notification) => (
            <Snackbar
              key={notification.id}
              visible={notification.visible}
              onDismiss={() => hideNotification(notification.id)}
              duration={notification.duration}
              style={[
                styles.snackbar,
                { backgroundColor: getSnackbarColor(notification.type) }
              ]}
              action={{
                label: 'Fechar',
                onPress: () => hideNotification(notification.id),
                textColor: 'white'
              }}
            >
              {notification.message}
            </Snackbar>
          ))}
        </View>
      </Portal>
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  snackbar: {
    marginBottom: 8,
    marginHorizontal: 16,
  },
});

export default NotificationProvider;
