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
import { useAuth } from '../../contexts/AuthProvider';
import { useTheme } from '../../contexts/ThemeContext';
import { firestoreService } from '../../services/firestoreService';

const PrivacySettingsScreen = ({ navigation }) => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const { getString } = useTheme();
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
      console.error(getString('logoutError'), error);
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
      
      Alert.alert(getString('success'), getString('settingsSavedSuccess'));
      navigation.goBack();
      
    } catch (error) {
      console.error(getString('logoutError'), error);
      Alert.alert(getString('error'), getString('settingsSaveError'));
    } finally {
      setLoading(false);
    }
  };

  const requestDataExport = () => {
    Alert.alert(
      getString('exportDataTitle'),
      getString('exportDataMessage'),
      [
        { text: getString('cancel'), style: 'cancel' },
        {
          text: getString('request'),
          onPress: () => {
            // Aqui seria implementada a lógica para solicitar exportação
            Alert.alert(getString('requestSent'), getString('exportRequestMessage'));
          }
        }
      ]
    );
  };

  const requestDataDeletion = () => {
    Alert.alert(
      getString('deleteDataTitle'),
      getString('deleteDataWarning'),
      [
        { text: getString('cancel'), style: 'cancel' },
        {
          text: getString('delete'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              getString('finalConfirmation'),
              getString('deleteConfirmMessage'),
              [
                { text: getString('cancel'), style: 'cancel' },
                {
                  text: getString('deleteAll'),
                  style: 'destructive',
                  onPress: () => {
                    // Aqui seria implementada a lógica para exclusão
                    Alert.alert(getString('requestRegistered'), getString('deleteRequestMessage'));
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
      Alert.alert(getString('error'), getString('privacyPolicyError'));
    });
  };

  const getVisibilityText = (visibility) => {
    switch (visibility) {
      case 'public': return getString('public');
      case 'academy': return getString('academy');
      case 'private': return getString('private');
      default: return getString('private');
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
              <Title style={styles.cardTitle}>{getString('lgpdStatus')}</Title>
              <Chip 
                mode="outlined"
                style={styles.statusChip}
                textStyle={{ fontSize: 12 }}
              >
                {getConsentStatus()} {getString('consents')}
              </Chip>
            </View>

            <Paragraph style={styles.lgpdInfo}>
              {getString('lgpdInfo')}
            </Paragraph>

            {settings.consentDate && (
              <Text style={styles.consentDate}>
                {getString('consentGivenOn')} {new Date(settings.consentDate).toLocaleDateString('pt-BR')}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Consentimentos LGPD */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text-outline" size={24} color="#2196F3" />
              <Title style={styles.cardTitle}>{getString('consents')}</Title>
            </View>

            <List.Item
              title={getString('dataProcessingConsent')}
              description={getString('dataProcessingDescription')}
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
              title={getString('marketingConsent')}
              description={getString('marketingDescription')}
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
              title={getString('analyticsConsent')}
              description={getString('analyticsDescription')}
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
              title={getString('thirdPartyConsent')}
              description={getString('thirdPartyDescription')}
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
              <Title style={styles.cardTitle}>{getString('profileVisibility')}</Title>
            </View>

            <List.Item
              title={getString('profileVisibility')}
              description={`${getString('profileVisibilityDescription')} ${getVisibilityText(settings.profileVisibility)}`}
              left={() => <List.Icon icon="account-circle" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                Alert.alert(
                  getString('profileVisibilityTitle'),
                  getString('profileVisibilityQuestion'),
                  [
                    { text: getString('public'), onPress: () => updateSetting('profileVisibility', 'public') },
                    { text: getString('onlyAcademy'), onPress: () => updateSetting('profileVisibility', 'academy') },
                    { text: getString('private'), onPress: () => updateSetting('profileVisibility', 'private') },
                    { text: getString('cancel'), style: 'cancel' }
                  ]
                );
              }}
            />
            <Divider />

            <List.Item
              title={getString('shareTrainingData')}
              description={getString('shareTrainingDescription')}
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
              title={getString('shareProgressData')}
              description={getString('shareProgressDescription')}
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
              <Title style={styles.cardTitle}>{getString('contactMethods')}</Title>
            </View>

            <List.Item
              title={getString('whatsappContact')}
              description={getString('whatsappDescription')}
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
              title={getString('emailContact')}
              description={getString('emailDescription')}
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
              title={getString('phoneContact')}
              description={getString('phoneDescription')}
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
              <Title style={styles.cardTitle}>{getString('yourRights')}</Title>
            </View>

            <List.Item
              title={getString('exportData')}
              description={getString('exportDescription')}
              left={() => <List.Icon icon="download" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={requestDataExport}
            />
            <Divider />

            <List.Item
              title={getString('privacyPolicy')}
              description={getString('privacyPolicyDescription')}
              left={() => <List.Icon icon="file-document" />}
              right={() => <List.Icon icon="open-in-new" />}
              onPress={openPrivacyPolicy}
            />
            <Divider />

            <List.Item
              title={getString('deleteData')}
              description={getString('deleteDescription')}
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
            <Title style={styles.cardTitle}>{getString('importantInfo')}</Title>
            <Text style={styles.infoText}>
              {getString('infoChangeConsents')}
            </Text>
            <Text style={styles.infoText}>
              {getString('infoRequiredConsents')}
            </Text>
            <Text style={styles.infoText}>
              {getString('infoProcessingTime')}
            </Text>
            <Text style={styles.infoText}>
              {getString('infoContact')}
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
            {getString('saveSettings')}
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
