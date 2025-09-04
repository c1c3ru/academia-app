import React from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import { Appbar, Avatar, Menu, Divider, Modal, Portal, Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { ResponsiveUtils } from '../utils/animations';

const UniversalHeader = ({ 
  title, 
  subtitle, 
  navigation, 
  showBack = false,
  showMenu = true,
  backgroundColor = '#4CAF50'
}) => {
  const { user, userProfile, logout } = useAuth();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = React.useState(false);

  const openMenu = () => {
    console.log('🔐 Avatar clicado - abrindo menu');
    setMenuVisible(true);
  };
  const closeMenu = () => {
    console.log('🔐 Fechando menu');
    setMenuVisible(false);
  };

  const handleLogout = () => {
    console.log('🔐 Botão de logout clicado');
    console.log('🔐 Função logout disponível:', typeof logout);
    console.log('🔐 User atual:', user?.email);
    console.log('🔐 UserProfile atual:', userProfile?.name);
    
    if (!logout) {
      console.error('🔐 Função logout não está disponível!');
      Alert.alert('Erro', 'Função de logout não está disponível. Recarregue o app.');
      return;
    }
    
    // No web, usar modal personalizado; no mobile, usar Alert nativo
    if (Platform.OS === 'web') {
      setLogoutModalVisible(true);
    } else {
      Alert.alert(
        'Confirmar Saída',
        'Tem certeza que deseja sair da sua conta?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => console.log('🔐 Logout cancelado pelo usuário')
          },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('🔐 Iniciando processo de logout...');
                closeMenu(); // Fechar menu antes do logout
                await logout();
                console.log('🔐 Logout executado com sucesso');
              } catch (error) {
                console.error('🔐 Erro no logout:', error);
                Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
              }
            },
          },
        ]
      );
    }
  };

  const confirmLogout = async () => {
    try {
      console.log('🔐 Iniciando processo de logout...');
      setLogoutModalVisible(false);
      closeMenu(); // Fechar menu antes do logout
      await logout();
      console.log('🔐 Logout executado com sucesso');
    } catch (error) {
      console.error('🔐 Erro no logout:', error);
      Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
    }
  };

  const cancelLogout = () => {
    console.log('🔐 Logout cancelado pelo usuário');
    setLogoutModalVisible(false);
  };

  const handleProfile = () => {
    closeMenu();
    navigation?.navigate('Profile');
  };

  const getUserTypeColor = () => {
    switch (userProfile?.userType) {
      case 'admin':
        return '#FF9800';
      case 'instructor':
        return '#4CAF50';
      case 'student':
        return '#2196F3';
      default:
        return '#4CAF50';
    }
  };

  const getUserTypeLabel = () => {
    switch (userProfile?.userType) {
      case 'admin':
        return 'Administrador';
      case 'instructor':
        return 'Instrutor';
      case 'student':
        return 'Aluno';
      default:
        return 'Usuário';
    }
  };

  console.log('🔐 UniversalHeader renderizando - showMenu:', showMenu, 'menuVisible:', menuVisible);

  return (
    <>
      <Appbar.Header style={[styles.header, { backgroundColor: getUserTypeColor() }]}>
        {showBack && (
          <Appbar.BackAction 
            onPress={() => navigation?.goBack()} 
            color="white"
          />
        )}
        
        <Appbar.Content 
          title="🥋 Academia App"
          subtitle={subtitle}
          titleStyle={styles.appName}
          subtitleStyle={styles.subtitle}
        />

        {showMenu && (
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity 
                style={styles.menuAnchor}
                onPress={openMenu}
                activeOpacity={0.7}
              >
                <Avatar.Text 
                  size={ResponsiveUtils?.isTablet?.() ? 40 : 36}
                  label={userProfile?.name?.charAt(0) || 'U'}
                  style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                  labelStyle={styles.avatarLabel}
                />
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent}
          >
              <View style={styles.menuHeader}>
                <Avatar.Text 
                  size={48}
                  label={userProfile?.name?.charAt(0) || 'U'}
                  style={[styles.menuAvatar, { backgroundColor: getUserTypeColor() }]}
                  labelStyle={styles.menuAvatarLabel}
                />
                <View style={styles.menuUserInfo}>
                  <Menu.Item
                    title={userProfile?.name || 'Usuário'}
                    titleStyle={styles.menuUserName}
                    disabled
                  />
                  <Menu.Item
                    title={getUserTypeLabel()}
                    titleStyle={styles.menuUserType}
                    disabled
                  />
                </View>
              </View>
              
              <Divider style={styles.menuDivider} />
              
              <Menu.Item
                onPress={handleProfile}
                title="Meu Perfil"
                leadingIcon={() => (
                  <MaterialCommunityIcons name="account" size={20} color="#666" />
                )}
                titleStyle={styles.menuItemTitle}
              />
              
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  // Implementar configurações se necessário
                }}
                title="Configurações"
                leadingIcon={() => (
                  <MaterialCommunityIcons name="cog" size={20} color="#666" />
                )}
                titleStyle={styles.menuItemTitle}
              />
              
              <Divider style={styles.menuDivider} />
              
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  handleLogout();
                }}
                title="Sair"
                leadingIcon={() => (
                  <MaterialCommunityIcons name="logout" size={20} color="#F44336" />
                )}
                titleStyle={[styles.menuItemTitle, { color: '#F44336' }]}
              />
            </Menu>
        )}
      </Appbar.Header>
      
      {/* Modal de confirmação de logout para web */}
      <Portal>
        <Modal
          visible={logoutModalVisible}
          onDismiss={cancelLogout}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Saída</Text>
            <Text style={styles.modalMessage}>
              Tem certeza que deseja sair da sua conta?
            </Text>
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={cancelLogout}
                style={styles.modalButton}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={confirmLogout}
                style={[styles.modalButton, styles.logoutButton]}
                buttonColor="#F44336"
              >
                Sair
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingHorizontal: ResponsiveUtils?.spacing?.xs || 4,
    minHeight: ResponsiveUtils?.isTablet?.() ? 64 : 56,
  },
  appName: {
    color: 'white',
    fontSize: ResponsiveUtils?.fontSize?.large || 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: ResponsiveUtils?.fontSize?.small || 12,
  },
  menuAnchor: {
    paddingRight: ResponsiveUtils?.spacing?.sm || 8,
    paddingVertical: ResponsiveUtils?.spacing?.xs || 4,
  },
  avatar: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarLabel: {
    color: 'white',
    fontSize: ResponsiveUtils?.fontSize?.medium || 16,
    fontWeight: 'bold',
  },
  menuContent: {
    backgroundColor: 'white',
    borderRadius: ResponsiveUtils?.borderRadius?.medium || 8,
    minWidth: 280,
    marginTop: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ResponsiveUtils?.spacing?.md || 16,
    backgroundColor: '#f8f9fa',
  },
  menuAvatar: {
    marginRight: ResponsiveUtils?.spacing?.md || 16,
  },
  menuAvatarLabel: {
    color: 'white',
    fontSize: ResponsiveUtils?.fontSize?.medium || 16,
    fontWeight: 'bold',
  },
  menuUserInfo: {
    flex: 1,
  },
  menuUserName: {
    fontSize: ResponsiveUtils?.fontSize?.medium || 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: -8,
  },
  menuUserType: {
    fontSize: ResponsiveUtils?.fontSize?.small || 12,
    color: '#666',
    marginTop: -8,
  },
  menuDivider: {
    marginVertical: 4,
  },
  menuItemTitle: {
    fontSize: ResponsiveUtils?.fontSize?.medium || 16,
    color: '#333',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  logoutButton: {
    backgroundColor: '#F44336',
  },
});

export default UniversalHeader;
