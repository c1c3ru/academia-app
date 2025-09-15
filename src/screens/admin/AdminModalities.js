import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Chip,
  Divider,
  Text,
  List,
  FAB,
  Searchbar,
  TextInput,
  Dialog,
  Portal
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthProvider';
import { useAuthMigration } from '../../hooks/useAuthMigration';
import { useTheme } from '../../contexts/ThemeContext';
import { firestoreService } from '../../services/firestoreService';

const AdminModalities = ({ navigation }) => {
  const { user } = useAuth();
  const { userProfile } = useAuthMigration();
  const { getString } = useTheme();
  const [modalities, setModalities] = useState([]);
  const [plans, setPlans] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para diálogos
  const [modalityDialogVisible, setModalityDialogVisible] = useState(false);
  const [planDialogVisible, setPlanDialogVisible] = useState(false);
  const [announcementDialogVisible, setAnnouncementDialogVisible] = useState(false);
  
  // Estados para edição
  const [editingModality, setEditingModality] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  
  // Estados para formulários
  const [newModality, setNewModality] = useState({ name: '', description: '' });
  const [newPlan, setNewPlan] = useState({ name: '', value: '', duration: '', description: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ 
    title: '', 
    content: '', 
    expirationDate: '',
    targetAudience: 'all' // 'all', 'students', 'instructors'
  });

  useEffect(() => {
    loadData();
    
    // Debug do usuário atual
    console.log('=== DEBUG USER INFO ===');
    console.log('User:', user);
    console.log('User Profile:', userProfile);
    console.log('User UID:', user?.uid);
    console.log('User Type:', user?.userType);
    console.log('User Tipo:', user?.tipo);
    console.log('Profile UserType:', userProfile?.userType);
    console.log('Profile Tipo:', userProfile?.tipo);
    console.log('======================');
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Buscar modalidades
      const modalitiesData = await firestoreService.getAll('modalities');
      setModalities(modalitiesData);
      
      // Buscar planos
      const plansData = await firestoreService.getAll('plans');
      setPlans(plansData);
      
      // Buscar avisos
      const announcementsData = await firestoreService.getAll('announcements');
      setAnnouncements(announcementsData);
      
    } catch (error) {
      console.error(getString('logoutError'), error);
      Alert.alert(getString('error'), getString('errorLoadingData'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Funções para modalidades
  const handleAddModality = async () => {
    if (!newModality.name.trim()) {
      Alert.alert(getString('error'), getString('modalityNameRequired'));
      return;
    }

    try {
      if (editingModality) {
        // Editar modalidade existente
        await firestoreService.update('modalities', editingModality.id, newModality);
        Alert.alert(getString('success'), 'Modalidade atualizada com sucesso!');
      } else {
        // Criar nova modalidade
        await firestoreService.create('modalities', newModality);
        Alert.alert(getString('success'), getString('modalityCreatedSuccess'));
      }
      
      setNewModality({ name: '', description: '' });
      setEditingModality(null);
      setModalityDialogVisible(false);
      loadData();
    } catch (error) {
      Alert.alert(getString('error'), editingModality ? 'Erro ao atualizar modalidade' : getString('errorCreatingModality'));
    }
  };

  const handleEditModality = (modality) => {
    setEditingModality(modality);
    setNewModality({ name: modality.name, description: modality.description || '' });
    setModalityDialogVisible(true);
  };

  const handleDeleteModality = (modality) => {
    Alert.alert(
      getString('confirmDeletion'),
      `Tem certeza que deseja excluir a modalidade "${modality.name}"?`,
      [
        { text: getString('cancel'), style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('=== DEBUG DELETE MODALITY ===');
              console.log('Modalidade ID:', modality.id);
              console.log('User UID:', user?.uid);
              console.log('User Type:', user?.userType);
              console.log('User Tipo:', user?.tipo);
              console.log('User Profile:', userProfile);
              console.log('================================');
              
              await firestoreService.delete('modalities', modality.id);
              
              // Atualizar lista local imediatamente
              setModalities(prev => prev.filter(m => m.id !== modality.id));
              
              Alert.alert('Sucesso', 'Modalidade excluída com sucesso!');
            } catch (error) {
              console.error('Erro detalhado ao excluir modalidade:', error);
              console.error('Error code:', error.code);
              console.error('Error message:', error.message);
              Alert.alert('Erro', `Erro ao excluir modalidade: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  // Funções para planos
  const handleAddPlan = async () => {
    if (!newPlan.name.trim() || !newPlan.value.trim()) {
      Alert.alert(getString('error'), getString('planNameAndValueRequired'));
      return;
    }

    try {
      const planData = {
        ...newPlan,
        value: parseFloat(newPlan.value),
        duration: parseInt(newPlan.duration) || 1
      };
      
      if (editingPlan) {
        // Editar plano existente
        await firestoreService.update('plans', editingPlan.id, planData);
        Alert.alert(getString('success'), 'Plano atualizado com sucesso!');
      } else {
        // Criar novo plano
        await firestoreService.create('plans', planData);
        Alert.alert(getString('success'), getString('planCreatedSuccess'));
      }
      
      setNewPlan({ name: '', value: '', duration: '', description: '' });
      setEditingPlan(null);
      setPlanDialogVisible(false);
      loadData();
    } catch (error) {
      Alert.alert(getString('error'), editingPlan ? 'Erro ao atualizar plano' : getString('errorCreatingPlan'));
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setNewPlan({ 
      name: plan.name, 
      value: plan.value.toString(), 
      duration: plan.duration.toString(), 
      description: plan.description || '' 
    });
    setPlanDialogVisible(true);
  };

  const handleDeletePlan = (plan) => {
    Alert.alert(
      getString('confirmDeletion'),
      `Tem certeza que deseja excluir o plano "${plan.name}"?`,
      [
        { text: getString('cancel'), style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('=== DEBUG DELETE PLAN ===');
              console.log('Plano ID:', plan.id);
              console.log('User UID:', user?.uid);
              console.log('User Type:', user?.userType);
              console.log('User Tipo:', user?.tipo);
              console.log('User Profile:', userProfile);
              console.log('========================');
              
              await firestoreService.delete('plans', plan.id);
              
              // Atualizar lista local imediatamente
              setPlans(prev => prev.filter(p => p.id !== plan.id));
              
              Alert.alert('Sucesso', 'Plano excluído com sucesso!');
            } catch (error) {
              console.error('Erro detalhado ao excluir plano:', error);
              console.error('Error code:', error.code);
              console.error('Error message:', error.message);
              Alert.alert('Erro', `Erro ao excluir plano: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  // Funções para avisos
  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      Alert.alert(getString('error'), getString('announcementTitleAndContentRequired'));
      return;
    }

    try {
      const announcementData = {
        ...newAnnouncement,
        expirationDate: newAnnouncement.expirationDate ? new Date(newAnnouncement.expirationDate) : null,
        publishedBy: user.uid,
        targetAudience: newAnnouncement.targetAudience,
        createdAt: editingAnnouncement ? editingAnnouncement.createdAt : new Date(),
        updatedAt: editingAnnouncement ? new Date() : null
      };
      
      if (editingAnnouncement) {
        // Editar aviso existente
        await firestoreService.update('announcements', editingAnnouncement.id, announcementData);
        Alert.alert(getString('success'), 'Aviso atualizado com sucesso!');
      } else {
        // Criar novo aviso
        await firestoreService.create('announcements', announcementData);
        Alert.alert(getString('success'), getString('announcementPublishedSuccess'));
      }
      
      setNewAnnouncement({ title: '', content: '', expirationDate: '', targetAudience: 'all' });
      setEditingAnnouncement(null);
      setAnnouncementDialogVisible(false);
      loadData();
    } catch (error) {
      Alert.alert(getString('error'), editingAnnouncement ? 'Erro ao atualizar aviso' : getString('errorPublishingAnnouncement'));
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content,
      expirationDate: announcement.expirationDate ? formatDate(announcement.expirationDate) : '',
      targetAudience: announcement.targetAudience || 'all'
    });
    setAnnouncementDialogVisible(true);
  };

  const handleDeleteAnnouncement = (announcement) => {
    Alert.alert(
      getString('confirmDeletion'),
      `Tem certeza que deseja excluir o aviso "${announcement.title}"?`,
      [
        { text: getString('cancel'), style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('=== DEBUG DELETE ANNOUNCEMENT ===');
              console.log('Aviso ID:', announcement.id);
              console.log('User UID:', user?.uid);
              console.log('User Type:', user?.userType);
              console.log('User Tipo:', user?.tipo);
              console.log('User Profile:', userProfile);
              console.log('================================');
              
              await firestoreService.delete('announcements', announcement.id);
              
              // Atualizar lista local imediatamente
              setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
              
              Alert.alert('Sucesso', 'Aviso excluído com sucesso!');
            } catch (error) {
              console.error('Erro detalhado ao excluir aviso:', error);
              console.error('Error code:', error.code);
              console.error('Error message:', error.message);
              Alert.alert('Erro', `Erro ao excluir aviso: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return getString('noExpirationDate');
    return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString('pt-BR');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Modalidades de Luta */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="fitness-outline" size={24} color="#4CAF50" />
              <Title style={styles.cardTitle}>{getString('fightModalities')}</Title>
              <Button 
                mode="contained" 
                onPress={() => setModalityDialogVisible(true)}
                icon="plus"
                style={styles.addButton}
              >
                {getString('add')}
              </Button>
            </View>
            
            {modalities.length > 0 ? (
              modalities.map((modality, index) => (
                <View key={modality.id || index}>
                  <List.Item
                    title={modality.name}
                    description={modality.description || getString('noDescription')}
                    left={() => <List.Icon icon="dumbbell" color="#4CAF50" />}
                    right={() => (
                      <View style={styles.actionButtons}>
                        <Button 
                          mode="text" 
                          onPress={() => handleEditModality(modality)}
                          textColor="#2196F3"
                          icon="pencil"
                          compact
                        >
                          Editar
                        </Button>
                        <Button 
                          mode="text" 
                          onPress={() => handleDeleteModality(modality)}
                          textColor="#F44336"
                          icon="delete"
                          compact
                        >
                          Excluir
                        </Button>
                      </View>
                    )}
                  />
                  {index < modalities.length - 1 && <Divider />}
                </View>
              ))
            ) : (
              <Paragraph style={styles.emptyText}>
                {getString('noModalitiesRegistered')}
              </Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Planos de Pagamento */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="card-outline" size={24} color="#2196F3" />
              <Title style={styles.cardTitle}>{getString('paymentPlans')}</Title>
              <Button 
                mode="contained" 
                onPress={() => setPlanDialogVisible(true)}
                icon="plus"
                style={styles.addButton}
              >
                {getString('add')}
              </Button>
            </View>
            
            {plans.length > 0 ? (
              plans.map((plan, index) => (
                <View key={plan.id || index}>
                  <List.Item
                    title={`${plan.name} - ${formatCurrency(plan.value)}`}
                    description={`${plan.duration || 1} ${getString('months')} • ${plan.description || getString('noDescription')}`}
                    left={() => <List.Icon icon="cash" color="#2196F3" />}
                    right={() => (
                      <View style={styles.actionButtons}>
                        <Button 
                          mode="text" 
                          onPress={() => handleEditPlan(plan)}
                          textColor="#2196F3"
                          icon="pencil"
                          compact
                        >
                          Editar
                        </Button>
                        <Button 
                          mode="text" 
                          onPress={() => handleDeletePlan(plan)}
                          textColor="#F44336"
                          icon="delete"
                          compact
                        >
                          Excluir
                        </Button>
                      </View>
                    )}
                  />
                  {index < plans.length - 1 && <Divider />}
                </View>
              ))
            ) : (
              <Paragraph style={styles.emptyText}>
                {getString('noPlansRegistered')}
              </Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Avisos do Mural */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="megaphone-outline" size={24} color="#FF9800" />
              <Title style={styles.cardTitle}>{getString('announcementBoard')}</Title>
              <Button 
                mode="contained" 
                onPress={() => setAnnouncementDialogVisible(true)}
                icon="plus"
                style={styles.addButton}
              >
                {getString('publish')}
              </Button>
            </View>
            
            {announcements.length > 0 ? (
              announcements.map((announcement, index) => (
                <View key={announcement.id || index}>
                  <List.Item
                    title={announcement.title}
                    description={`${announcement.content.substring(0, 100)}${announcement.content.length > 100 ? '...' : ''}`}
                    left={() => <List.Icon icon="bullhorn" color="#FF9800" />}
                    right={() => (
                      <View style={styles.actionButtons}>
                        <Button 
                          mode="text" 
                          onPress={() => handleEditAnnouncement(announcement)}
                          textColor="#2196F3"
                          icon="pencil"
                          compact
                        >
                          Editar
                        </Button>
                        <Button 
                          mode="text" 
                          onPress={() => handleDeleteAnnouncement(announcement)}
                          textColor="#F44336"
                          icon="delete"
                          compact
                        >
                          Excluir
                        </Button>
                      </View>
                    )}
                  />
                  <Text style={styles.announcementDate}>
                    {getString('expiresOn')} {formatDate(announcement.expirationDate)}
                  </Text>
                  {index < announcements.length - 1 && <Divider />}
                </View>
              ))
            ) : (
              <Paragraph style={styles.emptyText}>
                {getString('noAnnouncementsPublished')}
              </Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Estatísticas */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statsTitle}>{getString('summary')}</Title>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{modalities.length}</Text>
                <Text style={styles.statLabel}>{getString('modalities')}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{plans.length}</Text>
                <Text style={styles.statLabel}>{getString('plans')}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{announcements.length}</Text>
                <Text style={styles.statLabel}>{getString('activeAnnouncements')}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Diálogos */}
      <Portal>
        {/* Diálogo para adicionar modalidade */}
        <Dialog visible={modalityDialogVisible} onDismiss={() => {
          setModalityDialogVisible(false);
          setEditingModality(null);
          setNewModality({ name: '', description: '' });
        }}>
          <Dialog.Title>{editingModality ? 'Editar Modalidade' : getString('newModality')}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={getString('modalityName')}
              value={newModality.name}
              onChangeText={(text) => setNewModality({...newModality, name: text})}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label={getString('optionalDescription')}
              value={newModality.description}
              onChangeText={(text) => setNewModality({...newModality, description: text})}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setModalityDialogVisible(false);
              setEditingModality(null);
              setNewModality({ name: '', description: '' });
            }}>{getString('cancel')}</Button>
            <Button onPress={handleAddModality}>
              {editingModality ? 'Atualizar' : getString('create')}
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Diálogo para adicionar plano */}
        <Dialog visible={planDialogVisible} onDismiss={() => {
          setPlanDialogVisible(false);
          setEditingPlan(null);
          setNewPlan({ name: '', value: '', duration: '', description: '' });
        }}>
          <Dialog.Title>{editingPlan ? 'Editar Plano' : getString('newPlan')}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={getString('planName')}
              value={newPlan.name}
              onChangeText={(text) => setNewPlan({...newPlan, name: text})}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label={getString('valueInReais')}
              value={newPlan.value}
              onChangeText={(text) => setNewPlan({...newPlan, value: text})}
              mode="outlined"
              keyboardType="numeric"
              style={styles.dialogInput}
            />
            <TextInput
              label={getString('durationMonths')}
              value={newPlan.duration}
              onChangeText={(text) => setNewPlan({...newPlan, duration: text})}
              mode="outlined"
              keyboardType="numeric"
              style={styles.dialogInput}
            />
            <TextInput
              label={getString('optionalDescription')}
              value={newPlan.description}
              onChangeText={(text) => setNewPlan({...newPlan, description: text})}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setPlanDialogVisible(false);
              setEditingPlan(null);
              setNewPlan({ name: '', value: '', duration: '', description: '' });
            }}>{getString('cancel')}</Button>
            <Button onPress={handleAddPlan}>
              {editingPlan ? 'Atualizar' : getString('create')}
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Diálogo para adicionar aviso */}
        <Dialog visible={announcementDialogVisible} onDismiss={() => {
          setAnnouncementDialogVisible(false);
          setEditingAnnouncement(null);
          setNewAnnouncement({ title: '', content: '', expirationDate: '', targetAudience: 'all' });
        }}>
          <Dialog.Title>{editingAnnouncement ? 'Editar Aviso' : getString('newAnnouncement')}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={getString('announcementTitle')}
              value={newAnnouncement.title}
              onChangeText={(text) => setNewAnnouncement({...newAnnouncement, title: text})}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label={getString('content')}
              value={newAnnouncement.content}
              onChangeText={(text) => setNewAnnouncement({...newAnnouncement, content: text})}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.dialogInput}
            />
            <TextInput
              label={getString('optionalExpirationDate')}
              value={newAnnouncement.expirationDate}
              onChangeText={(text) => setNewAnnouncement({...newAnnouncement, expirationDate: text})}
              mode="outlined"
              placeholder="DD/MM/AAAA"
              style={styles.dialogInput}
            />
            
            <Text style={styles.sectionLabel}>{getString('targetAudience')}</Text>
            <View style={styles.audienceContainer}>
              <Chip 
                selected={newAnnouncement.targetAudience === 'all'}
                onPress={() => setNewAnnouncement({...newAnnouncement, targetAudience: 'all'})}
                style={styles.audienceChip}
              >
                {getString('all')}
              </Chip>
              <Chip 
                selected={newAnnouncement.targetAudience === 'students'}
                onPress={() => setNewAnnouncement({...newAnnouncement, targetAudience: 'students'})}
                style={styles.audienceChip}
              >
                {getString('students')}
              </Chip>
              <Chip 
                selected={newAnnouncement.targetAudience === 'instructors'}
                onPress={() => setNewAnnouncement({...newAnnouncement, targetAudience: 'instructors'})}
                style={styles.audienceChip}
              >
                {getString('instructors')}
              </Chip>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setAnnouncementDialogVisible(false);
              setEditingAnnouncement(null);
              setNewAnnouncement({ title: '', content: '', expirationDate: '', targetAudience: 'all' });
            }}>{getString('cancel')}</Button>
            <Button onPress={handleAddAnnouncement}>
              {editingAnnouncement ? 'Atualizar' : getString('publish')}
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
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
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
  addButton: {
    backgroundColor: '#4CAF50',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  announcementDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 56,
    marginTop: -8,
    marginBottom: 8,
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
    backgroundColor: '#E8F5E8',
  },
  statsTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  dialogInput: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  audienceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  audienceChip: {
    marginRight: 8,
    marginBottom: 8,
  },
});

export default AdminModalities;
