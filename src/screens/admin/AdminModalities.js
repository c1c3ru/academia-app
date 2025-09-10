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
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';

const AdminModalities = ({ navigation }) => {
  const { user } = useAuth();
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
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
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
      Alert.alert('Erro', 'Nome da modalidade é obrigatório');
      return;
    }

    try {
      await firestoreService.create('modalities', newModality);
      setNewModality({ name: '', description: '' });
      setModalityDialogVisible(false);
      loadData();
      Alert.alert('Sucesso', 'Modalidade criada com sucesso');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a modalidade');
    }
  };

  const handleDeleteModality = (modality) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir a modalidade ${modality.name}?\n\nEsta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Tentando excluir modalidade:', modality.id, 'User:', user?.uid, 'UserType:', user?.userType || user?.tipo);
              await firestoreService.delete('modalities', modality.id);
              
              // Atualizar lista local imediatamente
              setModalities(prev => prev.filter(m => m.id !== modality.id));
              
              Alert.alert('Sucesso', 'Modalidade excluída com sucesso!');
            } catch (error) {
              console.error('Erro detalhado ao excluir modalidade:', error);
              Alert.alert('Erro', `Não foi possível excluir a modalidade.\n\nMotivo: ${error.message || 'Erro desconhecido'}`);
            }
          }
        }
      ]
    );
  };

  // Funções para planos
  const handleAddPlan = async () => {
    if (!newPlan.name.trim() || !newPlan.value.trim()) {
      Alert.alert('Erro', 'Nome e valor do plano são obrigatórios');
      return;
    }

    try {
      const planData = {
        ...newPlan,
        value: parseFloat(newPlan.value),
        duration: parseInt(newPlan.duration) || 1
      };
      
      await firestoreService.create('plans', planData);
      setNewPlan({ name: '', value: '', duration: '', description: '' });
      setPlanDialogVisible(false);
      loadData();
      Alert.alert('Sucesso', 'Plano criado com sucesso');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o plano');
    }
  };

  const handleDeletePlan = (plan) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o plano ${plan.name}?\n\nEsta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Tentando excluir plano:', plan.id, 'User:', user?.uid, 'UserType:', user?.userType || user?.tipo);
              await firestoreService.delete('plans', plan.id);
              
              // Atualizar lista local imediatamente
              setPlans(prev => prev.filter(p => p.id !== plan.id));
              
              Alert.alert('Sucesso', 'Plano excluído com sucesso!');
            } catch (error) {
              console.error('Erro detalhado ao excluir plano:', error);
              Alert.alert('Erro', `Não foi possível excluir o plano.\n\nMotivo: ${error.message || 'Erro desconhecido'}`);
            }
          }
        }
      ]
    );
  };

  // Funções para avisos
  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      Alert.alert('Erro', 'Título e conteúdo do aviso são obrigatórios');
      return;
    }

    try {
      const announcementData = {
        ...newAnnouncement,
        expirationDate: newAnnouncement.expirationDate ? new Date(newAnnouncement.expirationDate) : null,
        publishedBy: user.uid,
        targetAudience: newAnnouncement.targetAudience,
        createdAt: new Date()
      };
      
      await firestoreService.create('announcements', announcementData);
      setNewAnnouncement({ title: '', content: '', expirationDate: '', targetAudience: 'all' });
      setAnnouncementDialogVisible(false);
      loadData();
      Alert.alert('Sucesso', 'Aviso publicado com sucesso');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível publicar o aviso');
    }
  };

  const handleDeleteAnnouncement = (announcement) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o aviso "${announcement.title}"?\n\nEsta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Tentando excluir anuncio:', announcement.id, 'User:', user?.uid, 'UserType:', user?.userType || user?.tipo);
              await firestoreService.delete('announcements', announcement.id);
              
              // Atualizar lista local imediatamente
              setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
              
              Alert.alert('Sucesso', 'Aviso excluído com sucesso!');
            } catch (error) {
              console.error('Erro detalhado ao excluir anuncio:', error);
              Alert.alert('Erro', `Não foi possível excluir o aviso.\n\nMotivo: ${error.message || 'Erro desconhecido'}`);
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
    if (!date) return 'Sem data de expiração';
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
              <Title style={styles.cardTitle}>Modalidades de Luta</Title>
              <Button 
                mode="contained" 
                onPress={() => setModalityDialogVisible(true)}
                icon="plus"
                style={styles.addButton}
              >
                Adicionar
              </Button>
            </View>
            
            {modalities.length > 0 ? (
              modalities.map((modality, index) => (
                <View key={modality.id || index}>
                  <List.Item
                    title={modality.name}
                    description={modality.description || 'Sem descrição'}
                    left={() => <List.Icon icon="dumbbell" color="#4CAF50" />}
                    right={() => (
                      <Button 
                        mode="text" 
                        onPress={() => handleDeleteModality(modality)}
                        textColor="#F44336"
                      >
                        Excluir
                      </Button>
                    )}
                  />
                  {index < modalities.length - 1 && <Divider />}
                </View>
              ))
            ) : (
              <Paragraph style={styles.emptyText}>
                Nenhuma modalidade cadastrada
              </Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Planos de Pagamento */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="card-outline" size={24} color="#2196F3" />
              <Title style={styles.cardTitle}>Planos de Pagamento</Title>
              <Button 
                mode="contained" 
                onPress={() => setPlanDialogVisible(true)}
                icon="plus"
                style={styles.addButton}
              >
                Adicionar
              </Button>
            </View>
            
            {plans.length > 0 ? (
              plans.map((plan, index) => (
                <View key={plan.id || index}>
                  <List.Item
                    title={`${plan.name} - ${formatCurrency(plan.value)}`}
                    description={`${plan.duration || 1} mês(es) • ${plan.description || 'Sem descrição'}`}
                    left={() => <List.Icon icon="cash" color="#2196F3" />}
                    right={() => (
                      <Button 
                        mode="text" 
                        onPress={() => handleDeletePlan(plan)}
                        textColor="#F44336"
                      >
                        Excluir
                      </Button>
                    )}
                  />
                  {index < plans.length - 1 && <Divider />}
                </View>
              ))
            ) : (
              <Paragraph style={styles.emptyText}>
                Nenhum plano cadastrado
              </Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Avisos do Mural */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="megaphone-outline" size={24} color="#FF9800" />
              <Title style={styles.cardTitle}>Mural de Avisos</Title>
              <Button 
                mode="contained" 
                onPress={() => setAnnouncementDialogVisible(true)}
                icon="plus"
                style={styles.addButton}
              >
                Publicar
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
                      <Button 
                        mode="text" 
                        onPress={() => handleDeleteAnnouncement(announcement)}
                        textColor="#F44336"
                      >
                        Excluir
                      </Button>
                    )}
                  />
                  <Text style={styles.announcementDate}>
                    Expira em: {formatDate(announcement.expirationDate)}
                  </Text>
                  {index < announcements.length - 1 && <Divider />}
                </View>
              ))
            ) : (
              <Paragraph style={styles.emptyText}>
                Nenhum aviso publicado
              </Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Estatísticas */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statsTitle}>Resumo</Title>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{modalities.length}</Text>
                <Text style={styles.statLabel}>Modalidades</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{plans.length}</Text>
                <Text style={styles.statLabel}>Planos</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{announcements.length}</Text>
                <Text style={styles.statLabel}>Avisos Ativos</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Diálogos */}
      <Portal>
        {/* Diálogo para adicionar modalidade */}
        <Dialog visible={modalityDialogVisible} onDismiss={() => setModalityDialogVisible(false)}>
          <Dialog.Title>Nova Modalidade</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nome da Modalidade"
              value={newModality.name}
              onChangeText={(text) => setNewModality({...newModality, name: text})}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Descrição (opcional)"
              value={newModality.description}
              onChangeText={(text) => setNewModality({...newModality, description: text})}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setModalityDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleAddModality}>Criar</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Diálogo para adicionar plano */}
        <Dialog visible={planDialogVisible} onDismiss={() => setPlanDialogVisible(false)}>
          <Dialog.Title>Novo Plano</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nome do Plano"
              value={newPlan.name}
              onChangeText={(text) => setNewPlan({...newPlan, name: text})}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Valor (R$)"
              value={newPlan.value}
              onChangeText={(text) => setNewPlan({...newPlan, value: text})}
              mode="outlined"
              keyboardType="numeric"
              style={styles.dialogInput}
            />
            <TextInput
              label="Duração (meses)"
              value={newPlan.duration}
              onChangeText={(text) => setNewPlan({...newPlan, duration: text})}
              mode="outlined"
              keyboardType="numeric"
              style={styles.dialogInput}
            />
            <TextInput
              label="Descrição (opcional)"
              value={newPlan.description}
              onChangeText={(text) => setNewPlan({...newPlan, description: text})}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPlanDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleAddPlan}>Criar</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Diálogo para adicionar aviso */}
        <Dialog visible={announcementDialogVisible} onDismiss={() => setAnnouncementDialogVisible(false)}>
          <Dialog.Title>Novo Aviso</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Título do Aviso"
              value={newAnnouncement.title}
              onChangeText={(text) => setNewAnnouncement({...newAnnouncement, title: text})}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Conteúdo"
              value={newAnnouncement.content}
              onChangeText={(text) => setNewAnnouncement({...newAnnouncement, content: text})}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.dialogInput}
            />
            <TextInput
              label="Data de Expiração (opcional)"
              value={newAnnouncement.expirationDate}
              onChangeText={(text) => setNewAnnouncement({...newAnnouncement, expirationDate: text})}
              mode="outlined"
              placeholder="DD/MM/AAAA"
              style={styles.dialogInput}
            />
            
            <Text style={styles.sectionLabel}>Público-alvo:</Text>
            <View style={styles.audienceContainer}>
              <Chip 
                selected={newAnnouncement.targetAudience === 'all'}
                onPress={() => setNewAnnouncement({...newAnnouncement, targetAudience: 'all'})}
                style={styles.audienceChip}
              >
                Todos
              </Chip>
              <Chip 
                selected={newAnnouncement.targetAudience === 'students'}
                onPress={() => setNewAnnouncement({...newAnnouncement, targetAudience: 'students'})}
                style={styles.audienceChip}
              >
                Alunos
              </Chip>
              <Chip 
                selected={newAnnouncement.targetAudience === 'instructors'}
                onPress={() => setNewAnnouncement({...newAnnouncement, targetAudience: 'instructors'})}
                style={styles.audienceChip}
              >
                Instrutores
              </Chip>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAnnouncementDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleAddAnnouncement}>Publicar</Button>
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
    marginVertical: 16,
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
