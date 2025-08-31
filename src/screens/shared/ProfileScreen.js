import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  Card, 
  Text, 
  Button,
  Badge,
  Avatar,
  Icon,
  ListItem,
  Divider
} from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, userProfile, updateUserProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    emergencyContact: '',
    medicalInfo: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        emergencyContact: userProfile.emergencyContact || '',
        medicalInfo: userProfile.medicalInfo || ''
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    try {
      await updateUserProfile(formData);
      setEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const getUserTypeText = (userType) => {
    switch (userType) {
      case 'student': return 'Aluno';
      case 'instructor': return 'Professor';
      case 'admin': return 'Administrador';
      default: return 'Usuário';
    }
  };

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case 'student': return '#2196F3';
      case 'instructor': return '#4CAF50';
      case 'admin': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header do Perfil */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <Avatar.Text 
              size={80} 
              label={userProfile?.name?.charAt(0) || 'U'} 
              style={[styles.avatar, { backgroundColor: getUserTypeColor(userProfile?.userType) }]}
            />
            <View style={styles.headerText}>
              <Text style={[styles.userName, { fontSize: 24, fontWeight: 'bold' }]}>{userProfile?.name || 'Usuário'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
                              <View 
                  style={[styles.userTypeChip, { borderColor: getUserTypeColor(userProfile?.userType) }]}
                >
                  <Text style={{ color: getUserTypeColor(userProfile?.userType) }}>
                    {getUserTypeText(userProfile?.userType)}
                  </Text>
                </View>
            </View>
          </Card.Content>
        </Card>

        {/* Informações Pessoais */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="person-outline" size={24} color="#2196F3" />
              <Text style={[styles.cardTitle, { fontSize: 20, fontWeight: 'bold' }]}>Informações Pessoais</Text>
              <Button 
                type="clear"
                onPress={() => setEditing(!editing)}
                icon={<Icon name={editing ? "close" : "pencil"} size={20} color="#666" />}
              >
                {editing ? 'Cancelar' : 'Editar'}
              </Button>
            </View>

            {editing ? (
              <View>
                <Input
                  label="Nome Completo"
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                  containerStyle={styles.input}
                />
                
                <Input
                  label="Telefone/WhatsApp"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({...formData, phone: text})}
                  containerStyle={styles.input}
                  keyboardType="phone-pad"
                />
                
                <Input
                  label="Endereço"
                  value={formData.address}
                  onChangeText={(text) => setFormData({...formData, address: text})}
                  containerStyle={styles.input}
                  multiline
                  numberOfLines={2}
                />
                
                <Input
                  label="Contato de Emergência"
                  value={formData.emergencyContact}
                  onChangeText={(text) => setFormData({...formData, emergencyContact: text})}
                  containerStyle={styles.input}
                />
                
                <Input
                  label="Informações Médicas"
                  value={formData.medicalInfo}
                  onChangeText={(text) => setFormData({...formData, medicalInfo: text})}
                  containerStyle={styles.input}
                  multiline
                  numberOfLines={3}
                  placeholder="Alergias, medicamentos, condições médicas..."
                />

                <Button 
                  type="solid"
                  onPress={handleSave}
                  buttonStyle={styles.saveButton}
                  icon={<Icon name="check" size={20} color="white" />}
                >
                  Salvar Alterações
                </Button>
              </View>
            ) : (
              <View>
                <List.Item
                  title="Nome"
                  description={userProfile?.name || 'Não informado'}
                  left={() => <List.Icon icon="account" />}
                />
                <Divider />
                
                <List.Item
                  title="Telefone"
                  description={userProfile?.phone || 'Não informado'}
                  left={() => <List.Icon icon="phone" />}
                />
                <Divider />
                
                <List.Item
                  title="Endereço"
                  description={userProfile?.address || 'Não informado'}
                  left={() => <List.Icon icon="map-marker" />}
                />
                <Divider />
                
                <List.Item
                  title="Contato de Emergência"
                  description={userProfile?.emergencyContact || 'Não informado'}
                  left={() => <List.Icon icon="phone-alert" />}
                />
                <Divider />
                
                <List.Item
                  title="Informações Médicas"
                  description={userProfile?.medicalInfo || 'Não informado'}
                  left={() => <List.Icon icon="medical-bag" />}
                />
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Informações da Academia (apenas para alunos) */}
        {userProfile?.userType === 'student' && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="school-outline" size={24} color="#4CAF50" />
                <Title style={styles.cardTitle}>Informações da Academia</Title>
              </View>

              <List.Item
                title="Graduação Atual"
                description={userProfile?.currentGraduation || 'Iniciante'}
                left={() => <List.Icon icon="trophy" color="#FFD700" />}
              />
              <Divider />
              
              <List.Item
                title="Plano Atual"
                description={userProfile?.currentPlan || 'Não definido'}
                left={() => <List.Icon icon="card-membership" />}
              />
              <Divider />
              
              <List.Item
                title="Data de Início"
                description={userProfile?.startDate ? 
                  new Date(userProfile.startDate).toLocaleDateString('pt-BR') : 
                  'Não informado'
                }
                left={() => <List.Icon icon="calendar-start" />}
              />
            </Card.Content>
          </Card>
        )}

        {/* Configurações da Conta */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="settings-outline" size={24} color="#666" />
              <Title style={styles.cardTitle}>Configurações da Conta</Title>
            </View>

            <List.Item
              title="Alterar Senha"
              description="Clique para alterar sua senha"
              left={() => <List.Icon icon="lock" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => Alert.alert('Info', 'Funcionalidade será implementada')}
            />
            <Divider />
            
            <List.Item
              title="Notificações"
              description="Configurar notificações do app"
              left={() => <List.Icon icon="bell" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => Alert.alert('Info', 'Funcionalidade será implementada')}
            />
            <Divider />
            
            <List.Item
              title="Privacidade"
              description="Configurações de privacidade"
              left={() => <List.Icon icon="shield" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => Alert.alert('Info', 'Funcionalidade será implementada')}
            />
          </Card.Content>
        </Card>

        {/* Ações da Conta */}
        <Card style={styles.card}>
          <Card.Content>
            <Button 
              mode="outlined" 
              onPress={handleLogout}
              style={styles.logoutButton}
              icon="logout"
              textColor="#F44336"
            >
              Sair da Conta
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
    paddingBottom: 100,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  avatar: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userTypeChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  card: {
    margin: 16,
    marginTop: 8,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
  input: {
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#4CAF50',
  },
  logoutButton: {
    borderColor: '#F44336',
    marginTop: 8,
  },
});

export default ProfileScreen;
