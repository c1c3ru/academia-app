import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Text,
  Switch,
  List,
  Button,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';

const NotificationSettingsScreen = ({ navigation }) => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Notificações gerais
    pushNotifications: true,
    emailNotifications: true,
    
    // Notificações específicas
    paymentReminders: true,
    classReminders: true,
    announcementNotifications: true,
    evaluationReminders: true,
    
    // Configurações de tempo
    paymentReminderDays: 3,
    classReminderMinutes: 30,
    
    // Horários de notificação
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00'
  });

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      if (userProfile?.notificationSettings) {
        setSettings({
          ...settings,
          ...userProfile.notificationSettings
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      
      await updateUserProfile({
        notificationSettings: settings
      });
      
      Alert.alert('Sucesso', 'Configurações de notificação salvas com sucesso');
      navigation.goBack();
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      Alert.alert('Erro', 'Não foi possível salvar as configurações');
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Restaurar Padrões',
      'Tem certeza que deseja restaurar as configurações padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          onPress: () => {
            setSettings({
              pushNotifications: true,
              emailNotifications: true,
              paymentReminders: true,
              classReminders: true,
              announcementNotifications: true,
              evaluationReminders: true,
              paymentReminderDays: 3,
              classReminderMinutes: 30,
              quietHoursEnabled: false,
              quietHoursStart: '22:00',
              quietHoursEnd: '08:00'
            });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Configurações Gerais */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="notifications-outline" size={24} color="#2196F3" />
              <Title style={styles.cardTitle}>Notificações Gerais</Title>
            </View>

            <List.Item
              title="Notificações Push"
              description="Receber notificações no dispositivo"
              left={() => <List.Icon icon="cellphone" />}
              right={() => (
                <Switch
                  value={settings.pushNotifications}
                  onValueChange={(value) => updateSetting('pushNotifications', value)}
                />
              )}
            />
            <Divider />

            <List.Item
              title="Notificações por Email"
              description="Receber notificações por email"
              left={() => <List.Icon icon="email" />}
              right={() => (
                <Switch
                  value={settings.emailNotifications}
                  onValueChange={(value) => updateSetting('emailNotifications', value)}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Tipos de Notificação */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="list-outline" size={24} color="#4CAF50" />
              <Title style={styles.cardTitle}>Tipos de Notificação</Title>
            </View>

            <List.Item
              title="Lembretes de Pagamento"
              description="Notificações sobre vencimento de mensalidades"
              left={() => <List.Icon icon="credit-card" />}
              right={() => (
                <Switch
                  value={settings.paymentReminders}
                  onValueChange={(value) => updateSetting('paymentReminders', value)}
                />
              )}
            />
            <Divider />

            <List.Item
              title="Lembretes de Aula"
              description="Notificações sobre horários de treino"
              left={() => <List.Icon icon="calendar" />}
              right={() => (
                <Switch
                  value={settings.classReminders}
                  onValueChange={(value) => updateSetting('classReminders', value)}
                />
              )}
            />
            <Divider />

            <List.Item
              title="Avisos da Academia"
              description="Notificações sobre comunicados importantes"
              left={() => <List.Icon icon="bullhorn" />}
              right={() => (
                <Switch
                  value={settings.announcementNotifications}
                  onValueChange={(value) => updateSetting('announcementNotifications', value)}
                />
              )}
            />
            <Divider />

            <List.Item
              title="Lembretes de Avaliação"
              description="Notificações sobre avaliações físicas"
              left={() => <List.Icon icon="clipboard-pulse" />}
              right={() => (
                <Switch
                  value={settings.evaluationReminders}
                  onValueChange={(value) => updateSetting('evaluationReminders', value)}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Configurações de Tempo */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={24} color="#FF9800" />
              <Title style={styles.cardTitle}>Configurações de Tempo</Title>
            </View>

            <List.Item
              title="Lembrete de Pagamento"
              description={`Notificar ${settings.paymentReminderDays} dias antes do vencimento`}
              left={() => <List.Icon icon="calendar-clock" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                Alert.alert(
                  'Dias de Antecedência',
                  'Quantos dias antes do vencimento deseja ser notificado?',
                  [
                    { text: '1 dia', onPress: () => updateSetting('paymentReminderDays', 1) },
                    { text: '3 dias', onPress: () => updateSetting('paymentReminderDays', 3) },
                    { text: '5 dias', onPress: () => updateSetting('paymentReminderDays', 5) },
                    { text: '7 dias', onPress: () => updateSetting('paymentReminderDays', 7) },
                    { text: 'Cancelar', style: 'cancel' }
                  ]
                );
              }}
            />
            <Divider />

            <List.Item
              title="Lembrete de Aula"
              description={`Notificar ${settings.classReminderMinutes} minutos antes da aula`}
              left={() => <List.Icon icon="alarm" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                Alert.alert(
                  'Minutos de Antecedência',
                  'Quantos minutos antes da aula deseja ser notificado?',
                  [
                    { text: '15 min', onPress: () => updateSetting('classReminderMinutes', 15) },
                    { text: '30 min', onPress: () => updateSetting('classReminderMinutes', 30) },
                    { text: '60 min', onPress: () => updateSetting('classReminderMinutes', 60) },
                    { text: 'Cancelar', style: 'cancel' }
                  ]
                );
              }}
            />
          </Card.Content>
        </Card>

        {/* Horário Silencioso */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="moon-outline" size={24} color="#9C27B0" />
              <Title style={styles.cardTitle}>Horário Silencioso</Title>
            </View>

            <List.Item
              title="Ativar Horário Silencioso"
              description="Não receber notificações em horários específicos"
              left={() => <List.Icon icon="volume-off" />}
              right={() => (
                <Switch
                  value={settings.quietHoursEnabled}
                  onValueChange={(value) => updateSetting('quietHoursEnabled', value)}
                />
              )}
            />

            {settings.quietHoursEnabled && (
              <>
                <Divider />
                <List.Item
                  title="Início do Silêncio"
                  description={settings.quietHoursStart}
                  left={() => <List.Icon icon="clock-start" />}
                  right={() => <List.Icon icon="chevron-right" />}
                  onPress={() => {
                    Alert.alert('Info', 'Seletor de horário será implementado');
                  }}
                />
                <Divider />
                <List.Item
                  title="Fim do Silêncio"
                  description={settings.quietHoursEnd}
                  left={() => <List.Icon icon="clock-end" />}
                  right={() => <List.Icon icon="chevron-right" />}
                  onPress={() => {
                    Alert.alert('Info', 'Seletor de horário será implementado');
                  }}
                />
              </>
            )}
          </Card.Content>
        </Card>

        {/* Informações */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Informações</Title>
            <Text style={styles.infoText}>
              • As notificações push requerem permissão do sistema
            </Text>
            <Text style={styles.infoText}>
              • Notificações por email são enviadas para {user?.email}
            </Text>
            <Text style={styles.infoText}>
              • O horário silencioso não afeta notificações urgentes
            </Text>
          </Card.Content>
        </Card>

        {/* Botões de Ação */}
        <View style={styles.buttonContainer}>
          <Button 
            mode="outlined" 
            onPress={resetToDefaults}
            style={styles.resetButton}
            icon="restore"
          >
            Restaurar Padrões
          </Button>
          
          <Button 
            mode="contained" 
            onPress={saveSettings}
            loading={loading}
            style={styles.saveButton}
            icon="check"
          >
            Salvar Configurações
          </Button>
        </View>
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
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
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
  infoText: {
    marginBottom: 8,
    color: '#666',
    fontSize: 14,
  },
  buttonContainer: {
    margin: 16,
    gap: 12,
  },
  resetButton: {
    borderColor: '#FF9800',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
});

export default NotificationSettingsScreen;
