import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-elements';

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
      <View style={styles.container}>
        {notifications.map((notification) => (
          notification.visible && (
            <View
              key={notification.id}
              style={[
                styles.snackbar,
                { backgroundColor: getSnackbarColor(notification.type) }
              ]}
            >
              <Text style={styles.snackbarText}>{notification.message}</Text>
              <TouchableOpacity
                onPress={() => hideNotification(notification.id)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          )
        ))}
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    ...Platform.select({

      ios: {

        shadowColor: '#000',

        shadowOffset: { width: 0, height: 2 },

        shadowOpacity: 0.1,

        shadowRadius: 4,

      },

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',

      },

    }),
  },
  snackbarText: {
    color: 'white',
    flex: 1,
    fontSize: 14,
  },
  closeButton: {
    marginLeft: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default NotificationProvider;
