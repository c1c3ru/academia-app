import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Text, 
  Button,
  ListItem,
  Switch,
  Icon,
  Divider
} from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

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
      <ScrollView style={styles.container}>
        {/* Informações da Conta */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="account-circle" type="material" size={24} color="#2196F3" />
            <Text h4 style={styles.cardTitle}>Conta</Text>
          </View>
          
          <ListItem bottomDivider>
            <Icon name="person" type="material" />
            <ListItem.Content>
              <ListItem.Title>Nome</ListItem.Title>
              <ListItem.Subtitle>{userProfile?.name || 'Não informado'}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
          
          <ListItem bottomDivider>
            <Icon name="email" type="material" />
            <ListItem.Content>
              <ListItem.Title>Email</ListItem.Title>
              <ListItem.Subtitle>{user?.email}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
          
          <ListItem bottomDivider onPress={() => navigation.navigate('Profile')}>
            <Icon name="edit" type="material" />
            <ListItem.Content>
              <ListItem.Title>Editar Perfil</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          
          <ListItem onPress={handleChangePassword}>
            <Icon name="lock" type="material" />
            <ListItem.Content>
              <ListItem.Title>Alterar Senha</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        </Card>

        {/* Preferências */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="settings" type="material" size={24} color="#4CAF50" />
            <Text h4 style={styles.cardTitle}>Preferências</Text>
          </View>
          
          <ListItem bottomDivider>
            <Icon name="notifications" type="material" />
            <ListItem.Content>
              <ListItem.Title>Notificações</ListItem.Title>
              <ListItem.Subtitle>Receber notificações push</ListItem.Subtitle>
            </ListItem.Content>
            <Switch 
              value={notifications} 
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: '#2196F3' }}
            />
          </ListItem>
          
          <ListItem bottomDivider>
            <Icon name="dark-mode" type="material" />
            <ListItem.Content>
              <ListItem.Title>Modo Escuro</ListItem.Title>
              <ListItem.Subtitle>Tema escuro da aplicação</ListItem.Subtitle>
            </ListItem.Content>
            <Switch 
              value={darkMode} 
              onValueChange={setDarkMode}
              trackColor={{ false: '#767577', true: '#2196F3' }}
            />
          </ListItem>
          
          <ListItem>
            <Icon name="backup" type="material" />
            <ListItem.Content>
              <ListItem.Title>Backup Automático</ListItem.Title>
              <ListItem.Subtitle>Backup automático dos dados</ListItem.Subtitle>
            </ListItem.Content>
            <Switch 
              value={autoBackup} 
              onValueChange={setAutoBackup}
              trackColor={{ false: '#767577', true: '#2196F3' }}
            />
          </ListItem>
        </Card>

        {/* Dados e Privacidade */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="privacy-tip" type="material" size={24} color="#FF9800" />
            <Text h4 style={styles.cardTitle}>Dados e Privacidade</Text>
          </View>
          
          <ListItem bottomDivider onPress={handleDataExport}>
            <Icon name="download" type="material" />
            <ListItem.Content>
              <ListItem.Title>Exportar Dados</ListItem.Title>
              <ListItem.Subtitle>Baixar uma cópia dos seus dados</ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          
          <ListItem bottomDivider>
            <Icon name="policy" type="material" />
            <ListItem.Content>
              <ListItem.Title>Política de Privacidade</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          
          <ListItem>
            <Icon name="gavel" type="material" />
            <ListItem.Content>
              <ListItem.Title>Termos de Uso</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        </Card>

        {/* Sobre */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="info" type="material" size={24} color="#9C27B0" />
            <Text h4 style={styles.cardTitle}>Sobre</Text>
          </View>
          
          <ListItem bottomDivider>
            <Icon name="apps" type="material" />
            <ListItem.Content>
              <ListItem.Title>Versão do App</ListItem.Title>
              <ListItem.Subtitle>1.0.0</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
          
          <ListItem bottomDivider>
            <Icon name="help" type="material" />
            <ListItem.Content>
              <ListItem.Title>Central de Ajuda</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          
          <ListItem>
            <Icon name="feedback" type="material" />
            <ListItem.Content>
              <ListItem.Title>Enviar Feedback</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        </Card>

        {/* Ações Perigosas */}
        <Card containerStyle={[styles.card, styles.dangerCard]}>
          <View style={styles.cardHeader}>
            <Icon name="warning" type="material" size={24} color="#F44336" />
            <Text h4 style={[styles.cardTitle, styles.dangerTitle]}>Zona de Perigo</Text>
          </View>
          
          <Button
            title="Sair da Conta"
            onPress={handleLogout}
            buttonStyle={[styles.dangerButton, { backgroundColor: '#FF9800' }]}
            icon={<Icon name="logout" type="material" size={20} color="white" />}
          />
          
          <Button
            title="Excluir Conta"
            onPress={handleDeleteAccount}
            buttonStyle={[styles.dangerButton, { backgroundColor: '#F44336', marginTop: 12 }]}
            icon={<Icon name="delete-forever" type="material" size={20} color="white" />}
          />
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
  card: {
    margin: 16,
    marginTop: 8,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  dangerCard: {
    backgroundColor: '#FFF5F5',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 18,
  },
  dangerTitle: {
    color: '#F44336',
  },
  dangerButton: {
    borderRadius: 12,
    marginBottom: 8,
  },
});

export default SettingsScreen;
