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
import { useAuth } from '../../contexts/AuthContext';
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
    Alert.alert('Em Desenvolvimento', 'Funcionalidade será implementada em breve');
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
        <Card style={styles.card}>
          <Card.Title 
            title="Conta" 
            left={(props) => <Ionicons name="person-circle" size={24} color="#2196F3" />}
          />
          <Card.Content>
            <List.Item
              title="Nome"
              description={userProfile?.name || 'Não informado'}
              left={(props) => <Ionicons name="person" size={20} color="#666" />}
            />
            <Divider />
            <List.Item
              title="Email"
              description={user?.email}
              left={(props) => <Ionicons name="mail" size={20} color="#666" />}
            />
            <Divider />
            <List.Item
              title="Editar Perfil"
              left={(props) => <Ionicons name="create" size={20} color="#666" />}
              right={(props) => <Ionicons name="chevron-forward" size={20} color="#666" />}
              onPress={() => navigation.navigate('Profile')}
            />
            <Divider />
            <List.Item
              title="Alterar Senha"
              left={(props) => <Ionicons name="lock-closed" size={20} color="#666" />}
              right={(props) => <Ionicons name="chevron-forward" size={20} color="#666" />}
              onPress={handleChangePassword}
            />
          </Card.Content>
        </Card>

        {/* Preferências */}
        <Card style={styles.card}>
          <Card.Title 
            title="Preferências" 
            left={(props) => <Ionicons name="settings" size={24} color="#4CAF50" />}
          />
          <Card.Content>
            <List.Item
              title="Notificações"
              description="Receber notificações push"
              left={(props) => <Ionicons name="notifications" size={20} color="#666" />}
              right={() => (
                <Switch 
                  value={notifications} 
                  onValueChange={setNotifications}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Modo Escuro"
              description="Tema escuro da aplicação"
              left={(props) => <Ionicons name="moon" size={20} color="#666" />}
              right={() => (
                <Switch 
                  value={darkMode} 
                  onValueChange={setDarkMode}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Idioma"
              description="Português (Brasil)"
              left={(props) => <Ionicons name="language" size={20} color="#666" />}
              right={(props) => <Ionicons name="chevron-forward" size={20} color="#666" />}
              onPress={() => Alert.alert('Em Desenvolvimento', 'Seleção de idioma será implementada em breve')}
            />
            <Divider />
            <List.Item
              title="Backup Automático"
              description="Backup automático dos dados"
              left={(props) => <Ionicons name="cloud-upload" size={20} color="#666" />}
              right={() => (
                <Switch 
                  value={autoBackup} 
                  onValueChange={setAutoBackup}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Dados e Privacidade */}
        <Card style={styles.card}>
          <Card.Title 
            title="Dados e Privacidade" 
            left={(props) => <Ionicons name="shield-checkmark" size={24} color="#FF9800" />}
          />
          <Card.Content>
            <List.Item
              title="Exportar Dados"
              description="Baixar uma cópia dos seus dados"
              left={(props) => <Ionicons name="download" size={20} color="#666" />}
              right={(props) => <Ionicons name="chevron-forward" size={20} color="#666" />}
              onPress={handleDataExport}
            />
            <Divider />
            <List.Item
              title="Política de Privacidade"
              left={(props) => <Ionicons name="document-text" size={20} color="#666" />}
              right={(props) => <Ionicons name="chevron-forward" size={20} color="#666" />}
            />
            <Divider />
            <List.Item
              title="Termos de Uso"
              left={(props) => <Ionicons name="reader" size={20} color="#666" />}
              right={(props) => <Ionicons name="chevron-forward" size={20} color="#666" />}
            />
          </Card.Content>
        </Card>

        {/* Sobre */}
        <Card style={styles.card}>
          <Card.Title 
            title="Sobre" 
            left={(props) => <Ionicons name="information-circle" size={24} color="#9C27B0" />}
          />
          <Card.Content>
            <List.Item
              title="Versão do App"
              description="1.0.0"
              left={(props) => <Ionicons name="apps" size={20} color="#666" />}
            />
            <Divider />
            <List.Item
              title="Central de Ajuda"
              left={(props) => <Ionicons name="help-circle" size={20} color="#666" />}
              right={(props) => <Ionicons name="chevron-forward" size={20} color="#666" />}
            />
            <Divider />
            <List.Item
              title="Enviar Feedback"
              left={(props) => <Ionicons name="chatbubble" size={20} color="#666" />}
              right={(props) => <Ionicons name="chevron-forward" size={20} color="#666" />}
            />
          </Card.Content>
        </Card>

        {/* Ações Perigosas */}
        <Card style={[styles.card, styles.dangerCard]}>
          <Card.Title 
            title="Zona de Perigo" 
            titleStyle={styles.dangerTitle}
            left={(props) => <Ionicons name="warning" size={24} color="#F44336" />}
          />
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleLogout}
              style={[styles.dangerButton, { backgroundColor: '#FF9800' }]}
              icon={() => <Ionicons name="log-out" size={20} color="white" />}
            >
              Sair da Conta
            </Button>
            
            <Button
              mode="contained"
              onPress={handleDeleteAccount}
              style={[styles.dangerButton, { backgroundColor: '#F44336', marginTop: 12 }]}
              icon={() => <Ionicons name="trash" size={20} color="white" />}
            >
              Excluir Conta
            </Button>
          </Card.Content>
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
