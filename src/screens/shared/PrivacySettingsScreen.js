import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { 
  Card, 
  Title, 
  Text,
  Switch,
  List,
  Button,
  Divider,
  Paragraph,
  Chip
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';

const PrivacySettingsScreen = ({ navigation }) => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Consentimentos LGPD
    dataProcessingConsent: false,
    marketingConsent: false,
    analyticsConsent: false,
    thirdPartyConsent: false,
    
    // Configurações de privacidade
    profileVisibility: 'private', // 'public', 'academy', 'private'
    shareTrainingData: false,
    shareProgressData: false,
    allowDataExport: true,
    
    // Configurações de comunicação
    allowWhatsAppContact: true,
    allowEmailContact: true,
    allowPhoneContact: false,
    
    // Data de consentimento
    consentDate: null,
    lastUpdated: null
  });

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      if (userProfile?.privacySettings) {
        setSettings({
          ...settings,
          ...userProfile.privacySettings
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
      lastUpdated: new Date().toISOString()
    }));
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      
      const updatedSettings = {
        ...settings,
        lastUpdated: new Date().toISOString()
      };

      // Se é a primeira vez dando consentimento, salvar a data
      if (!settings.consentDate && settings.dataProcessingConsent) {
        updatedSettings.consentDate = new Date().toISOString();
      }
      
      await updateUserProfile({
        privacySettings: updatedSettings
      });
      
      Alert.alert('Sucesso', 'Configurações de privacidade salvas com sucesso');
      navigation.goBack();
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      Alert.alert('Erro', 'Não foi possível salvar as configurações');
    } finally {
      setLoading(false);
    }
  };

  const requestDataExport = () => {
    Alert.alert(
      'Exportar Dados',
      'Você receberá um arquivo com todos os seus dados pessoais em até 30 dias, conforme previsto na LGPD.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Solicitar',
          onPress: () => {
            // Aqui seria implementada a lógica para solicitar exportação
            Alert.alert('Solicitação Enviada', 'Sua solicitação foi registrada. Você receberá os dados por email em até 30 dias.');
          }
        }
      ]
    );
  };

  const requestDataDeletion = () => {
    Alert.alert(
      'Excluir Dados',
      'ATENÇÃO: Esta ação irá excluir permanentemente todos os seus dados pessoais. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmação Final',
              'Tem certeza absoluta que deseja excluir todos os seus dados? Você perderá acesso à sua conta.',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Sim, excluir tudo',
                  style: 'destructive',
                  onPress: () => {
                    // Aqui seria implementada a lógica para exclusão
                    Alert.alert('Solicitação Registrada', 'Sua solicitação de exclusão foi registrada. Os dados serão removidos em até 30 dias.');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const openPrivacyPolicy = () => {
    // Aqui você colocaria o link real da política de privacidade
    const privacyPolicyUrl = 'https://academia-app.com/privacy-policy';
    Linking.openURL(privacyPolicyUrl).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir a política de privacidade');
    });
  };

  const getVisibilityText = (visibility) => {
    switch (visibility) {
      case 'public': return 'Público';
      case 'academy': return 'Apenas Academia';
      case 'private': return 'Privado';
      default: return 'Privado';
    }
  };

  const getConsentStatus = () => {
    const requiredConsents = [
      settings.dataProcessingConsent,
      settings.marketingConsent,
      settings.analyticsConsent
    ];
    const givenConsents = requiredConsents.filter(Boolean).length;
    return `${givenConsents}/${requiredConsents.length}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Status de Conformidade LGPD */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#4CAF50" />
              <Title style={styles.cardTitle}>Status LGPD</Title>
              <Chip 
                mode="outlined"
                style={styles.statusChip}
                textStyle={{ fontSize: 12 }}
              >
                {getConsentStatus()} Consentimentos
              </Chip>
            </View>

            <Paragraph style={styles.lgpdInfo}>
              A Lei Geral de Proteção de Dados (LGPD) garante seus direitos sobre seus dados pessoais. 
              Configure abaixo como seus dados podem ser utilizados.
            </Paragraph>

            {settings.consentDate && (
              <Text style={styles.consentDate}>
                Consentimento inicial dado em: {new Date(settings.consentDate).toLocaleDateString('pt-BR')}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Consentimentos LGPD */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text-outline" size={24} color="#2196F3" />
              <Title style={styles.cardTitle}>Consentimentos</Title>
            </View>

            <List.Item
              title="Processamento de Dados Pessoais"
              description="Permitir o uso de dados para funcionamento básico do app"
              left={() => <List.Icon icon="database" />}
              right={() => (
                <Switch
                  value={settings.dataProcessingConsent}
                  onValueChange={(value) => updateSetting('dataProcessingConsent', value)}
                />
              )}
            />
            <Divider />

            <List.Item
              title="Comunicações de Marketing"
              description="Receber ofertas, promoções e novidades"
              left={() => <List.Icon icon="bullhorn" />}
              right={() => (
                <Switch
                  value={settings.marketingConsent}
                  onValueChange={(value) => updateSetting('marketingConsent', value)}
                />
              )}
            />
            <Divider />

            <List.Item
              title="Análise e Melhorias"
              description="Usar dados para melhorar o app e serviços"
              left={() => <List.Icon icon="chart-line" />}
              right={() => (
                <Switch
                  value={settings.analyticsConsent}
                  onValueChange={(value) => updateSetting('analyticsConsent', value)}
                />
              )}
            />
            <Divider />

            <List.Item
              title="Compartilhamento com Terceiros"
              description="Permitir compartilhamento com parceiros (opcional)"
              left={() => <List.Icon icon="share-variant" />}
              right={() => (
                <Switch
                  value={settings.thirdPartyConsent}
                  onValueChange={(value) => updateSetting('thirdPartyConsent', value)}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Configurações de Visibilidade */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="eye-outline" size={24} color="#FF9800" />
              <Title style={styles.cardTitle}>Visibilidade do Perfil</Title>
            </View>

            <List.Item
              title="Visibilidade do Perfil"
              description={`Atualmente: ${getVisibilityText(settings.profileVisibility)}`}
              left={() => <List.Icon icon="account-circle" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                Alert.alert(
                  'Visibilidade do Perfil',
                  'Quem pode ver suas informações básicas?',
                  [
                    { text: 'Público', onPress: () => updateSetting('profileVisibility', 'public') },
                    { text: 'Apenas Academia', onPress: () => updateSetting('profileVisibility', 'academy') },
                    { text: 'Privado', onPress: () => updateSetting('profileVisibility', 'private') },
                    { text: 'Cancelar', style: 'cancel' }
                  ]
                );
              }}
            />
            <Divider />

            <List.Item
              title="Compartilhar Dados de Treino"
              description="Permitir que instrutores vejam seu progresso"
              left={() => <List.Icon icon="dumbbell" />}
              right={() => (
                <Switch
                  value={settings.shareTrainingData}
                  onValueChange={(value) => updateSetting('shareTrainingData', value)}
                />
              )}
            />
            <Divider />

            <List.Item
              title="Compartilhar Dados de Progresso"
              description="Permitir comparações e estatísticas gerais"
              left={() => <List.Icon icon="trending-up" />}
              right={() => (
                <Switch
                  value={settings.shareProgressData}
                  onValueChange={(value) => updateSetting('shareProgressData', value)}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Configurações de Contato */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="call-outline" size={24} color="#9C27B0" />
              <Title style={styles.cardTitle}>Formas de Contato</Title>
            </View>

            <List.Item
              title="Contato via WhatsApp"
              description="Permitir contato da academia via WhatsApp"
              left={() => <List.Icon icon="whatsapp" />}
              right={() => (
                <Switch
                  value={settings.allowWhatsAppContact}
                  onValueChange={(value) => updateSetting('allowWhatsAppContact', value)}
                />
              )}
            />
            <Divider />

            <List.Item
              title="Contato via Email"
              description="Permitir contato da academia via email"
              left={() => <List.Icon icon="email" />}
              right={() => (
                <Switch
                  value={settings.allowEmailContact}
                  onValueChange={(value) => updateSetting('allowEmailContact', value)}
                />
              )}
            />
            <Divider />

            <List.Item
              title="Contato via Telefone"
              description="Permitir ligações da academia"
              left={() => <List.Icon icon="phone" />}
              right={() => (
                <Switch
                  value={settings.allowPhoneContact}
                  onValueChange={(value) => updateSetting('allowPhoneContact', value)}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Direitos do Titular */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="person-outline" size={24} color="#F44336" />
              <Title style={styles.cardTitle}>Seus Direitos</Title>
            </View>

            <List.Item
              title="Exportar Meus Dados"
              description="Baixar uma cópia de todos os seus dados"
              left={() => <List.Icon icon="download" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={requestDataExport}
            />
            <Divider />

            <List.Item
              title="Política de Privacidade"
              description="Ler nossa política de privacidade completa"
              left={() => <List.Icon icon="file-document" />}
              right={() => <List.Icon icon="open-in-new" />}
              onPress={openPrivacyPolicy}
            />
            <Divider />

            <List.Item
              title="Excluir Meus Dados"
              description="Solicitar exclusão permanente de todos os dados"
              left={() => <List.Icon icon="delete-forever" color="#F44336" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={requestDataDeletion}
              titleStyle={{ color: '#F44336' }}
            />
          </Card.Content>
        </Card>

        {/* Informações Importantes */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Informações Importantes</Title>
            <Text style={styles.infoText}>
              • Você pode alterar seus consentimentos a qualquer momento
            </Text>
            <Text style={styles.infoText}>
              • Alguns consentimentos são necessários para o funcionamento básico do app
            </Text>
            <Text style={styles.infoText}>
              • Solicitações de exportação e exclusão são processadas em até 30 dias
            </Text>
            <Text style={styles.infoText}>
              • Para dúvidas sobre privacidade, entre em contato conosco
            </Text>
          </Card.Content>
        </Card>

        {/* Botões de Ação */}
        <View style={styles.buttonContainer}>
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
    flex: 1,
  },
  statusChip: {
    borderColor: '#4CAF50',
  },
  lgpdInfo: {
    marginBottom: 12,
    color: '#666',
    lineHeight: 20,
  },
  consentDate: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  infoText: {
    marginBottom: 8,
    color: '#666',
    fontSize: 14,
  },
  buttonContainer: {
    margin: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
});

export default PrivacySettingsScreen;
