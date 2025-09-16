import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  TextInput,
  Dialog,
  Portal,
  ActivityIndicator,
  Divider,
  Text,
  Chip
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthMigration } from '../../hooks/useAuthMigration';
import { useTheme } from '../../contexts/ThemeContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';

const AcademyOnboardingScreen = ({ navigation }) => {
  const { userProfile, user } = useAuthMigration();
  const { getString } = useTheme();
  
  // Estados para criação de academia
  const [createAcademyVisible, setCreateAcademyVisible] = useState(false);
  const [academyData, setAcademyData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: ''
  });
  
  // Estados para usar convite
  const [useInviteVisible, setUseInviteVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  
  // Estados de carregamento
  const [creatingAcademy, setCreatingAcademy] = useState(false);
  const [usingInvite, setUsingInvite] = useState(false);

  const handleCreateAcademy = async () => {
    if (!academyData.name.trim()) {
      Alert.alert('Erro', 'Nome da academia é obrigatório');
      return;
    }

    try {
      setCreatingAcademy(true);
      
      // Chamar Cloud Function para criar academia
      const createAcademyFunction = httpsCallable(functions, 'createAcademy');
      const result = await createAcademyFunction(academyData);
      
      if (result.data.success) {
        // Forçar atualização do token para incluir os novos claims
        await user.getIdToken(true);
        
        Alert.alert(
          'Sucesso!', 
          'Academia criada com sucesso! Você agora é o administrador.',
          [
            {
              text: 'OK',
              onPress: () => {
                setCreateAcademyVisible(false);
                // Navegar para o dashboard admin ou recarregar a aplicação
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Main' }],
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Erro ao criar academia:', error);
      Alert.alert('Erro', error.message || 'Erro ao criar academia');
    } finally {
      setCreatingAcademy(false);
    }
  };

  const handleUseInvite = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Erro', 'Código de convite é obrigatório');
      return;
    }

    try {
      setUsingInvite(true);
      
      // Chamar Cloud Function para usar convite
      const useInviteFunction = httpsCallable(functions, 'useInvite');
      const result = await useInviteFunction({ inviteCode: inviteCode.trim() });
      
      if (result.data.success) {
        // Forçar atualização do token para incluir os novos claims
        await user.getIdToken(true);
        
        const roleText = result.data.role === 'instructor' ? 'instrutor' : 'aluno';
        
        Alert.alert(
          'Sucesso!', 
          `Você foi associado à academia como ${roleText}!`,
          [
            {
              text: 'OK',
              onPress: () => {
                setUseInviteVisible(false);
                // Navegar para o dashboard apropriado ou recarregar a aplicação
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Main' }],
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Erro ao usar convite:', error);
      Alert.alert('Erro', error.message || 'Código de convite inválido ou expirado');
    } finally {
      setUsingInvite(false);
    }
  };

  const resetCreateAcademyForm = () => {
    setAcademyData({
      name: '',
      description: '',
      address: '',
      phone: '',
      email: ''
    });
  };

  const resetInviteForm = () => {
    setInviteCode('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="school-outline" size={64} color="#4CAF50" />
          <Title style={styles.title}>Bem-vindo ao Academia App!</Title>
          <Paragraph style={styles.subtitle}>
            Para começar, você precisa estar associado a uma academia. 
            Escolha uma das opções abaixo:
          </Paragraph>
        </View>

        <View style={styles.optionsContainer}>
          {/* Opção 1: Criar Nova Academia */}
          <Card style={styles.optionCard}>
            <Card.Content>
              <View style={styles.optionHeader}>
                <Ionicons name="add-circle-outline" size={32} color="#2196F3" />
                <Title style={styles.optionTitle}>Criar Minha Academia</Title>
              </View>
              <Paragraph style={styles.optionDescription}>
                Crie uma nova academia e torne-se o administrador. 
                Você poderá gerenciar alunos, instrutores e todas as configurações.
              </Paragraph>
              <Button 
                mode="contained" 
                onPress={() => setCreateAcademyVisible(true)}
                style={styles.optionButton}
                icon="plus"
              >
                Criar Academia
              </Button>
            </Card.Content>
          </Card>

          <Divider style={styles.divider} />

          {/* Opção 2: Usar Código de Convite */}
          <Card style={styles.optionCard}>
            <Card.Content>
              <View style={styles.optionHeader}>
                <Ionicons name="ticket-outline" size={32} color="#FF9800" />
                <Title style={styles.optionTitle}>Tenho um Código de Convite</Title>
              </View>
              <Paragraph style={styles.optionDescription}>
                Se você recebeu um código de convite de uma academia, 
                use-o para se associar como aluno ou instrutor.
              </Paragraph>
              <Button 
                mode="outlined" 
                onPress={() => setUseInviteVisible(true)}
                style={styles.optionButton}
                icon="ticket"
              >
                Usar Convite
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Informações adicionais */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.infoTitle}>Como funciona?</Title>
            <View style={styles.infoItem}>
              <Chip icon="shield-check" style={styles.infoChip}>Seguro</Chip>
              <Text style={styles.infoText}>
                Cada academia tem seus dados completamente isolados
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Chip icon="account-group" style={styles.infoChip}>Colaborativo</Chip>
              <Text style={styles.infoText}>
                Admins podem convidar instrutores e alunos
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Chip icon="cog" style={styles.infoChip}>Personalizável</Chip>
              <Text style={styles.infoText}>
                Cada academia gerencia suas próprias modalidades e planos
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Dialog para criar academia */}
      <Portal>
        <Dialog 
          visible={createAcademyVisible} 
          onDismiss={() => {
            setCreateAcademyVisible(false);
            resetCreateAcademyForm();
          }}
          style={styles.dialog}
        >
          <Dialog.Title>Criar Nova Academia</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nome da Academia *"
              value={academyData.name}
              onChangeText={(text) => setAcademyData(prev => ({ ...prev, name: text }))}
              mode="outlined"
              style={styles.input}
              disabled={creatingAcademy}
            />
            <TextInput
              label="Descrição"
              value={academyData.description}
              onChangeText={(text) => setAcademyData(prev => ({ ...prev, description: text }))}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              disabled={creatingAcademy}
            />
            <TextInput
              label="Endereço"
              value={academyData.address}
              onChangeText={(text) => setAcademyData(prev => ({ ...prev, address: text }))}
              mode="outlined"
              style={styles.input}
              disabled={creatingAcademy}
            />
            <TextInput
              label="Telefone"
              value={academyData.phone}
              onChangeText={(text) => setAcademyData(prev => ({ ...prev, phone: text }))}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              disabled={creatingAcademy}
            />
            <TextInput
              label="Email"
              value={academyData.email}
              onChangeText={(text) => setAcademyData(prev => ({ ...prev, email: text }))}
              mode="outlined"
              keyboardType="email-address"
              style={styles.input}
              disabled={creatingAcademy}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => {
                setCreateAcademyVisible(false);
                resetCreateAcademyForm();
              }}
              disabled={creatingAcademy}
            >
              Cancelar
            </Button>
            <Button 
              mode="contained" 
              onPress={handleCreateAcademy}
              disabled={creatingAcademy || !academyData.name.trim()}
              loading={creatingAcademy}
            >
              {creatingAcademy ? 'Criando...' : 'Criar Academia'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Dialog para usar convite */}
      <Portal>
        <Dialog 
          visible={useInviteVisible} 
          onDismiss={() => {
            setUseInviteVisible(false);
            resetInviteForm();
          }}
          style={styles.dialog}
        >
          <Dialog.Title>Usar Código de Convite</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={styles.inviteDescription}>
              Digite o código de convite que você recebeu do administrador da academia:
            </Paragraph>
            <TextInput
              label="Código de Convite *"
              value={inviteCode}
              onChangeText={setInviteCode}
              mode="outlined"
              style={styles.input}
              placeholder="Ex: abc123xyz789"
              autoCapitalize="none"
              disabled={usingInvite}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => {
                setUseInviteVisible(false);
                resetInviteForm();
              }}
              disabled={usingInvite}
            >
              Cancelar
            </Button>
            <Button 
              mode="contained" 
              onPress={handleUseInvite}
              disabled={usingInvite || !inviteCode.trim()}
              loading={usingInvite}
            >
              {usingInvite ? 'Verificando...' : 'Usar Convite'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    marginBottom: 16,
    elevation: 4,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    marginLeft: 12,
    fontSize: 20,
    color: '#333',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  optionButton: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#ddd',
  },
  infoCard: {
    backgroundColor: '#e8f5e8',
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    color: '#2e7d32',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoChip: {
    marginRight: 12,
    backgroundColor: '#4caf50',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2e7d32',
  },
  dialog: {
    maxWidth: 500,
    alignSelf: 'center',
  },
  input: {
    marginBottom: 12,
  },
  inviteDescription: {
    marginBottom: 16,
    color: '#666',
  },
});

export default AcademyOnboardingScreen;
