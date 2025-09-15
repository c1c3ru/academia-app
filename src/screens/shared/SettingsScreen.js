import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Dimensions } from 'react-native';
import { 
  Card, 
  Text, 
  Button,
  List,
  Switch,
  Divider
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthProvider';
import { ResponsiveUtils } from '../../utils/animations';

const SettingsScreen = ({ navigation }) => {
  const { user, userProfile, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Logout',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível fazer logout');
            }
          }
        }
      ]
    );
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleDataExport = () => {
    Alert.alert('Em Desenvolvimento', 'Funcionalidade de exportação será implementada em breve');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Esta ação é irreversível. Todos os seus dados serão perdidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Em Desenvolvimento', 'Funcionalidade será implementada em breve');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Informações da Conta */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle" size={24} color="#2196F3" />
            <Text h4 style={styles.cardTitle}>Conta</Text>
          </View>
          
          <List.Item
            title="Nome"
            description={userProfile?.name || 'Não informado'}
            left={(props) => <Ionicons name="person" size={20} color="#666" />}
          />
          
          <List.Item
            title="Email"
            description={user?.email}
            left={(props) => <Ionicons name="mail" size={20} color="#666" />}
          />
          
          <List.Item
            title="Editar Perfil"
            left={(props) => <Ionicons name="create" size={20} color="#666" />}
            right={(props) => <List.Icon icon="chevron-right" />}
            onPress={() => navigation.navigate('Profile')}
          />
          
          <List.Item
            title="Alterar Senha"
            left={(props) => <Ionicons name="lock-closed" size={20} color="#666" />}
            right={(props) => <List.Icon icon="chevron-right" />}
            onPress={handleChangePassword}
          />
        </Card>

        {/* Preferências */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="settings" size={24} color="#4CAF50" />
            <Text h4 style={styles.cardTitle}>Preferências</Text>
          </View>
          
          <List.Item
            title="Notificações"
            description="Receber notificações push"
            left={(props) => <Ionicons name="notifications" size={20} color="#666" />}
            right={(props) => (
              <Switch 
                value={notifications} 
                onValueChange={setNotifications}
                trackColor={{ false: '#767577', true: '#2196F3' }}
              />
            )}
          />
          
          <List.Item
            title="Modo Escuro"
            description="Tema escuro da aplicação"
            left={(props) => <Ionicons name="moon" size={20} color="#666" />}
            right={(props) => (
              <Switch 
                value={darkMode} 
                onValueChange={setDarkMode}
                trackColor={{ false: '#767577', true: '#2196F3' }}
              />
            )}
          />
          
          <List.Item
            title="Backup Automático"
            description="Backup automático dos dados"
            left={(props) => <Ionicons name="cloud-upload" size={20} color="#666" />}
            right={(props) => (
              <Switch 
                value={autoBackup} 
                onValueChange={setAutoBackup}
                trackColor={{ false: '#767577', true: '#2196F3' }}
              />
            )}
          />
        </Card>

        {/* Dados e Privacidade */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#FF9800" />
            <Text h4 style={styles.cardTitle}>Dados e Privacidade</Text>
          </View>
          
          <List.Item
            title="Exportar Dados"
            description="Baixar uma cópia dos seus dados"
            left={(props) => <Ionicons name="download" size={20} color="#666" />}
            right={(props) => <List.Icon icon="chevron-right" />}
            onPress={handleDataExport}
          />
          
          <List.Item
            title="Política de Privacidade"
            left={(props) => <Ionicons name="document-text" size={20} color="#666" />}
            right={(props) => <List.Icon icon="chevron-right" />}
          />
          
          <List.Item
            title="Termos de Uso"
            left={(props) => <Ionicons name="library" size={20} color="#666" />}
            right={(props) => <List.Icon icon="chevron-right" />}
          />
        </Card>

        {/* Sobre */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#9C27B0" />
            <Text h4 style={styles.cardTitle}>Sobre</Text>
          </View>
          
          <List.Item
            title="Versão do App"
            description="1.0.0"
            left={(props) => <Ionicons name="apps" size={20} color="#666" />}
          />
          
          <List.Item
            title="Central de Ajuda"
            left={(props) => <Ionicons name="help-circle" size={20} color="#666" />}
            right={(props) => <List.Icon icon="chevron-right" />}
          />
          
          <List.Item
            title="Enviar Feedback"
            left={(props) => <Ionicons name="chatbubble-ellipses" size={20} color="#666" />}
            right={(props) => <List.Icon icon="chevron-right" />}
          />
        </Card>

        {/* Ações Perigosas */}
        <Card containerStyle={[styles.card, styles.dangerCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="warning" size={24} color="#F44336" />
            <Text h4 style={[styles.cardTitle, styles.dangerTitle]}>Zona de Perigo</Text>
          </View>
          
          <Button
            mode="contained"
            onPress={handleLogout}
            buttonColor="#FF9800"
            textColor="white"
            icon={() => <Ionicons name="log-out" size={20} color="white" />}
            style={styles.dangerButton}
          >
            Sair da Conta
          </Button>
          
          <Button
            mode="contained"
            onPress={handleDeleteAccount}
            buttonColor="#F44336"
            textColor="white"
            icon={() => <Ionicons name="trash" size={20} color="white" />}
            style={[styles.dangerButton, { marginTop: 12 }]}
          >
            Excluir Conta
          </Button>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: ResponsiveUtils?.spacing?.xl || 32,
  },
  card: {
    margin: ResponsiveUtils?.spacing?.md || 16,
    marginTop: ResponsiveUtils?.spacing?.sm || 8,
    maxWidth: ResponsiveUtils?.isTablet?.() ? 600 : '100%',
    alignSelf: 'center',
    width: '100%',
    ...Platform.select({
      ios: {},
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  dangerCard: {
    backgroundColor: '#FFF5F5',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils?.spacing?.md || 16,
  },
  cardTitle: {
    marginLeft: ResponsiveUtils?.spacing?.sm || 8,
    fontSize: ResponsiveUtils?.fontSize?.large || 18,
  },
  dangerTitle: {
    color: '#F44336',
  },
  dangerButton: {
    borderRadius: ResponsiveUtils?.borderRadius?.medium || 12,
    marginBottom: ResponsiveUtils?.spacing?.sm || 8,
  },
});

export default SettingsScreen;
