import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
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
        { text: 'Cancelar' },
        { 
          text: 'Sair', 
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
                <View style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <Ionicons name="account" size={24} color="#666" />
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>Nome</Text>
                    <Text style={styles.listItemDescription}>{userProfile?.name || 'Não informado'}</Text>
                  </View>
                </View>
                <Divider />
                
                <View style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <Ionicons name="phone" size={24} color="#666" />
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>Telefone</Text>
                    <Text style={styles.listItemDescription}>{userProfile?.phone || 'Não informado'}</Text>
                  </View>
                </View>
                <Divider />
                
                <View style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <Ionicons name="map-marker" size={24} color="#666" />
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>Endereço</Text>
                    <Text style={styles.listItemDescription}>{userProfile?.address || 'Não informado'}</Text>
                  </View>
                </View>
                <Divider />
                
                <View style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <Ionicons name="phone-alert" size={24} color="#666" />
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>Contato de Emergência</Text>
                    <Text style={styles.listItemDescription}>{userProfile?.emergencyContact || 'Não informado'}</Text>
                  </View>
                </View>
                <Divider />
                
                <View style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <Ionicons name="medical-bag" size={24} color="#666" />
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>Informações Médicas</Text>
                    <Text style={styles.listItemDescription}>{userProfile?.medicalInfo || 'Não informado'}</Text>
                  </View>
                </View>
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
                <Text style={[styles.cardTitle, { fontSize: 20, fontWeight: 'bold' }]}>Informações da Academia</Text>
              </View>

              <View style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Ionicons name="trophy" size={24} color="#FFD700" />
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>Graduação Atual</Text>
                  <Text style={styles.listItemDescription}>{userProfile?.currentGraduation || 'Iniciante'}</Text>
                </View>
              </View>
              <Divider />
              
              <View style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Ionicons name="card-membership" size={24} color="#666" />
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>Plano Atual</Text>
                  <Text style={styles.listItemDescription}>{userProfile?.currentPlan || 'Não definido'}</Text>
                </View>
              </View>
              <Divider />
              
              <View style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Ionicons name="calendar-start" size={24} color="#666" />
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>Data de Início</Text>
                  <Text style={styles.listItemDescription}>{userProfile?.startDate ? 
                    new Date(userProfile.startDate).toLocaleDateString('pt-BR') : 
                    'Não informado'
                  }</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Configurações da Conta */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="settings-outline" size={24} color="#666" />
                              <Text style={[styles.cardTitle, { fontSize: 20, fontWeight: 'bold' }]}>Configurações da Conta</Text>
            </View>

            <TouchableOpacity style={styles.listItem} onPress={() => Alert.alert('Info', 'Funcionalidade será implementada')}>
              <View style={styles.listItemLeft}>
                <Ionicons name="lock" size={24} color="#666" />
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>Alterar Senha</Text>
                <Text style={styles.listItemDescription}>Clique para alterar sua senha</Text>
              </View>
              <View style={styles.listItemRight}>
                <Ionicons name="chevron-right" size={24} color="#666" />
              </View>
            </TouchableOpacity>
            <Divider />
            
            <TouchableOpacity style={styles.listItem} onPress={() => Alert.alert('Info', 'Funcionalidade será implementada')}>
              <View style={styles.listItemLeft}>
                <Ionicons name="bell" size={24} color="#666" />
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>Notificações</Text>
                <Text style={styles.listItemDescription}>Configurar notificações do app</Text>
              </View>
              <View style={styles.listItemRight}>
                <Ionicons name="chevron-right" size={24} color="#666" />
              </View>
            </TouchableOpacity>
            <Divider />
            
            <TouchableOpacity style={styles.listItem} onPress={() => Alert.alert('Info', 'Funcionalidade será implementada')}>
              <View style={styles.listItemLeft}>
                <Ionicons name="shield" size={24} color="#666" />
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>Privacidade</Text>
                <Text style={styles.listItemDescription}>Configurações de privacidade</Text>
              </View>
              <View style={styles.listItemRight}>
                <Ionicons name="chevron-right" size={24} color="#666" />
              </View>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Ações da Conta */}
        <Card style={styles.card}>
          <Card.Content>
            <Button 
              type="outline"
              onPress={handleLogout}
              buttonStyle={styles.logoutButton}
              icon={<Icon name="logout" size={20} color="#F44336" />}
              titleStyle={{ color: "#F44336" }}
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
    ...Platform.select({

      ios: {

        shadowColor: '#000',

        shadowOffset: { width: 0, height: 2 },

        shadowOpacity: 0.1,

        shadowRadius: 4,

      },

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',

      },

    }),
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
    ...Platform.select({

      ios: {

        shadowColor: '#000',

        shadowOffset: { width: 0, height: 2 },

        shadowOpacity: 0.1,

        shadowRadius: 4,

      },

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',

      },

    }),
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listItemLeft: {
    marginRight: 16,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  listItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  listItemRight: {
    marginLeft: 8,
  },
});

export default ProfileScreen;
