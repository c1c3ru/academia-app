import React, { useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import { Appbar, Avatar, Menu, Divider, Modal, Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthProvider';
import { ResponsiveUtils } from '../utils/animations';
// import NotificationBell from './NotificationBell';
import { useTheme } from '../contexts/ThemeContext';
// import { LinearGradient } from 'expo-linear-gradient';

const UniversalHeader = ({ 
  title, 
  subtitle, 
  navigation, 
  showBack = false,
  showMenu = true,
  backgroundColor = '#4CAF50'
}) => {
  const { user, userProfile, logout } = useAuth();
  const { getString, theme, updateUserTheme } = useTheme();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = React.useState(false);

  // Update theme when user type changes
  useEffect(() => {
    if (userProfile?.userType) {
      updateUserTheme(userProfile.userType);
    }
  }, [userProfile?.userType]); // Removido updateUserTheme das dependências

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
      Alert.alert(getString('error'), getString('logoutNotAvailable'));
      return;
    }
    
    // No web, usar modal personalizado; no mobile, usar Alert nativo
    if (Platform.OS === 'web') {
      setLogoutModalVisible(true);
    } else {
      Alert.alert(
        getString('confirmExit'),
        getString('sureToLogout'),
        [
          {
            text: getString('cancel'),
            style: 'cancel',
            onPress: () => console.log('🔐 Logout cancelado pelo usuário')
          },
          {
            text: getString('exit'),
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('🔐 Iniciando processo de logout...');
                closeMenu(); // Fechar menu antes do logout
                await logout();
                console.log('🔐 Logout executado com sucesso');
              } catch (error) {
                console.error('🔐 Erro no logout:', error);
                Alert.alert(getString('error'), getString('cannotLogout'));
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
      Alert.alert(getString('error'), getString('cannotLogout'));
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
    // Use professional colors from the theme system
    if (theme?.palette) {
      return theme.palette.primary;
    }
    
    // Fallback to professional colors based on user type
    switch (userProfile?.userType) {
      case 'admin':
        return '#6A1B9A';  // Professional Purple
      case 'instructor':
        return '#2E7D32'; // Professional Green
      case 'student':
        return '#1976D2'; // Professional Blue
      default:
        return '#1976D2';
    }
  };

  // const getHeaderGradient = () => {
  //   if (theme?.palette?.gradient) {
  //     return theme.palette.gradient;
  //   }
  //   
  //   // Fallback gradients based on user type
  //   const userType = userProfile?.userType || userProfile?.tipo || 'student';
  //   switch (userType) {
  //     case 'admin':
  //     case 'administrador':
  //       return ['#FF9800', '#F57C00'];
  //     case 'instructor':
  //     case 'instrutor':
  //       return ['#4CAF50', '#388E3C'];
  //     case 'student':
  //     case 'aluno':
  //     default:
  //       return ['#2196F3', '#1976D2'];
  //   }
  // };

  const getUserTypeLabel = () => {
    switch (userProfile?.userType) {
      case 'admin':
      case 'administrador':
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
      <View style={[styles.container, { backgroundColor }]}>
        <Appbar.Header style={[styles.header, styles.transparentHeader]}>
        {showBack && (
          <Appbar.BackAction 
            onPress={() => navigation?.goBack()} 
            color="white"
          />
        )}
        
        <Appbar.Content 
          title={title || "🥋 Academia App"}
          subtitle={subtitle}
          titleStyle={styles.appName}
          subtitleStyle={styles.subtitle}
        />

        {/* {showMenu && <NotificationBell color="white" size={24} />} */}

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
      </View>
      
      {/* Modal de confirmação de logout para web */}
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
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    ...Platform.select({
      web: {
        boxShadow: '0 2px 3.84px rgba(0, 0, 0, 0.25)'
      },
      default: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }
    }),
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
  gradientHeader: {
    elevation: ResponsiveUtils?.elevation?.small || 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  transparentHeader: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
});

export default UniversalHeader;
