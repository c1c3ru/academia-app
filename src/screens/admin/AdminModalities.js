import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  Alert,
  TouchableOpacity,
  Platform
} from 'react-native';
import { 
  Card, 
  Text, 
  Button,
  Input,
  Badge,
  Icon,
  ListItem,
  Divider
} from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import AccessibleDialog from '../../components/AccessibleDialog';

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
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', expirationDate: '' });

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
      `Tem certeza que deseja excluir a modalidade ${modality.name}?`,
      [
        { text: 'Cancelar' },
        { 
          text: 'Excluir', 
          onPress: async () => {
            try {
              await firestoreService.delete('modalities', modality.id);
              loadData();
              Alert.alert('Sucesso', 'Modalidade excluída com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a modalidade');
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
      `Tem certeza que deseja excluir o plano ${plan.name}?`,
      [
        { text: 'Cancelar' },
        { 
          text: 'Excluir', 
          onPress: async () => {
            try {
              await firestoreService.delete('plans', plan.id);
              loadData();
              Alert.alert('Sucesso', 'Plano excluído com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o plano');
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
        publishedBy: user.uid
      };
      
      await firestoreService.create('announcements', announcementData);
      setNewAnnouncement({ title: '', content: '', expirationDate: '' });
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
      `Tem certeza que deseja excluir o aviso "${announcement.title}"?`,
      [
        { text: 'Cancelar' },
        { 
          text: 'Excluir', 
          onPress: async () => {
            try {
              await firestoreService.delete('announcements', announcement.id);
              loadData();
              Alert.alert('Sucesso', 'Aviso excluído com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o aviso');
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Modalidades de Luta */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="fitness-outline" size={24} color="#4CAF50" />
              <Text style={[styles.cardTitle, { fontSize: 20, fontWeight: 'bold' }]}>Modalidades de Luta</Text>
              <Button 
                type="solid"
                onPress={() => setModalityDialogVisible(true)}
                icon={<Icon name="plus" size={20} color="white" />}
                buttonStyle={styles.addButton}
              >
                Adicionar
              </Button>
            </View>
            
            {modalities.length > 0 ? (
              modalities.map((modality, index) => (
                <View key={modality.id || index}>
                  <View style={styles.listItem}>
                    <View style={styles.listItemLeft}>
                      <Ionicons name="fitness" size={24} color="#4CAF50" />
                    </View>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>{modality.name}</Text>
                      <Text style={styles.listItemDescription}>{modality.description || 'Sem descrição'}</Text>
                    </View>
                    <View style={styles.listItemRight}>
                      <Button 
                        type="clear"
                        onPress={() => handleDeleteModality(modality)}
                        titleStyle={{ color: '#F44336' }}
                      >
                        Excluir
                      </Button>
                    </View>
                  </View>
                  {index < modalities.length - 1 && <Divider />}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                Nenhuma modalidade cadastrada
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Planos de Pagamento */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="card-outline" size={24} color="#2196F3" />
              <Text style={[styles.cardTitle, { fontSize: 20, fontWeight: 'bold' }]}>Planos de Pagamento</Text>
              <Button 
                type="solid"
                onPress={() => setPlanDialogVisible(true)}
                icon={<Icon name="plus" size={20} color="white" />}
                buttonStyle={styles.addButton}
              >
                Adicionar
              </Button>
            </View>
            
            {plans.length > 0 ? (
              plans.map((plan, index) => (
                <View key={plan.id || index}>
                  <View style={styles.listItem}>
                    <View style={styles.listItemLeft}>
                      <Ionicons name="cash" size={24} color="#2196F3" />
                    </View>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>{`${plan.name} - ${formatCurrency(plan.value)}`}</Text>
                      <Text style={styles.listItemDescription}>{`${plan.duration || 1} mês(es) • ${plan.description || 'Sem descrição'}`}</Text>
                    </View>
                    <View style={styles.listItemRight}>
                      <Button 
                        type="clear"
                        onPress={() => handleDeletePlan(plan)}
                        titleStyle={{ color: '#F44336' }}
                      >
                        Excluir
                      </Button>
                    </View>
                  </View>
                  {index < plans.length - 1 && <Divider />}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                Nenhum plano cadastrado
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Avisos do Mural */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="megaphone-outline" size={24} color="#FF9800" />
              <Text style={[styles.cardTitle, { fontSize: 20, fontWeight: 'bold' }]}>Mural de Avisos</Text>
              <Button 
                type="solid"
                onPress={() => setAnnouncementDialogVisible(true)}
                icon={<Icon name="plus" size={20} color="white" />}
                buttonStyle={styles.addButton}
              >
                Publicar
              </Button>
            </View>
            
            {announcements.length > 0 ? (
              announcements.map((announcement, index) => (
                <View key={announcement.id || index}>
                  <View style={styles.listItem}>
                    <View style={styles.listItemLeft}>
                      <Ionicons name="bullhorn" size={24} color="#FF9800" />
                    </View>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>{announcement.title}</Text>
                      <Text style={styles.listItemDescription}>{`${announcement.content.substring(0, 100)}${announcement.content.length > 100 ? '...' : ''}`}</Text>
                    </View>
                    <View style={styles.listItemRight}>
                      <Button 
                        type="clear"
                        onPress={() => handleDeleteAnnouncement(announcement)}
                        titleStyle={{ color: '#F44336' }}
                      >
                        Excluir
                      </Button>
                    </View>
                  </View>
                  <Text style={styles.announcementDate}>
                    Expira em: {formatDate(announcement.expirationDate)}
                  </Text>
                  {index < announcements.length - 1 && <Divider />}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                Nenhum aviso publicado
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Estatísticas */}
        <Card style={styles.statsCard}>
          <Card.Content>
                          <Text style={[styles.statsTitle, { fontSize: 20, fontWeight: 'bold' }]}>Resumo</Text>
            
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
      <AccessibleDialog 
        visible={modalityDialogVisible} 
        onDismiss={() => setModalityDialogVisible(false)}
      >
        <View style={styles.dialogContent}>
          <Text style={styles.dialogTitle}>Nova Modalidade</Text>
          <Input
            label="Nome da Modalidade"
            value={newModality.name}
            onChangeText={(text) => setNewModality({...newModality, name: text})}
            containerStyle={styles.dialogInput}
            accessibilityLabel="Nome da modalidade"
            accessibilityHint="Digite o nome da nova modalidade"
          />
          <Input
            label="Descrição (opcional)"
            value={newModality.description}
            onChangeText={(text) => setNewModality({...newModality, description: text})}
            multiline
            numberOfLines={3}
            containerStyle={styles.dialogInput}
            accessibilityLabel="Descrição da modalidade"
            accessibilityHint="Digite uma descrição opcional para a modalidade"
          />
          <View style={styles.dialogActions}>
            <Button 
              onPress={() => setModalityDialogVisible(false)}
              accessibilityLabel="Cancelar criação de modalidade"
              type="outline"
              style={styles.dialogButton}
            >
              Cancelar
            </Button>
            <Button 
              onPress={handleAddModality}
              accessibilityLabel="Criar nova modalidade"
              type="solid"
              style={styles.dialogButton}
            >
              Criar
            </Button>
          </View>
        </View>
      </AccessibleDialog>

      <AccessibleDialog 
        visible={planDialogVisible} 
        onDismiss={() => setPlanDialogVisible(false)}
      >
        <View style={styles.dialogContent}>
          <Text style={styles.dialogTitle}>Novo Plano</Text>
          <Input
            label="Nome do Plano"
            value={newPlan.name}
            onChangeText={(text) => setNewPlan({...newPlan, name: text})}
            containerStyle={styles.dialogInput}
          />
          <Input
            label="Valor (R$)"
            value={newPlan.value}
            onChangeText={(text) => setNewPlan({...newPlan, value: text})}
            containerStyle={styles.dialogInput}
            keyboardType="numeric"
          />
          <Input
            label="Duração (meses)"
            value={newPlan.duration}
            onChangeText={(text) => setNewPlan({...newPlan, duration: text})}
            containerStyle={styles.dialogInput}
            keyboardType="numeric"
          />
          <Input
            label="Descrição (opcional)"
            value={newPlan.description}
            onChangeText={(text) => setNewPlan({...newPlan, description: text})}
            containerStyle={styles.dialogInput}
            multiline
            numberOfLines={2}
          />
          <View style={styles.dialogActions}>
            <Button onPress={() => setPlanDialogVisible(false)} type="outline" style={styles.dialogButton}>Cancelar</Button>
            <Button onPress={handleAddPlan} type="solid" style={styles.dialogButton}>Criar</Button>
          </View>
        </View>
      </AccessibleDialog>

        {/* Diálogo para adicionar aviso */}
        <AccessibleDialog 
          visible={announcementDialogVisible} 
          onDismiss={() => setAnnouncementDialogVisible(false)}
        >
          <View style={styles.dialogContent}>
            <Text style={styles.dialogTitle}>Novo Aviso</Text>
            <Input
              label="Título do Aviso"
              value={newAnnouncement.title}
              onChangeText={(text) => setNewAnnouncement({...newAnnouncement, title: text})}
              containerStyle={styles.dialogInput}
            />
            <Input
              label="Conteúdo"
              value={newAnnouncement.content}
              onChangeText={(text) => setNewAnnouncement({...newAnnouncement, content: text})}
              containerStyle={styles.dialogInput}
              multiline
              numberOfLines={4}
            />
            <Input
              label="Data de Expiração (opcional)"
              value={newAnnouncement.expirationDate}
              onChangeText={(text) => setNewAnnouncement({...newAnnouncement, expirationDate: text})}
              containerStyle={styles.dialogInput}
              placeholder="DD/MM/AAAA"
            />
            <View style={styles.dialogActions}>
              <Button onPress={() => setAnnouncementDialogVisible(false)} type="outline" style={styles.dialogButton}>Cancelar</Button>
              <Button onPress={handleAddAnnouncement} type="solid" style={styles.dialogButton}>Publicar</Button>
            </View>
          </View>
        </AccessibleDialog>
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
  card: {
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
    backgroundColor: '#E8F5E8',
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
    }),
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
    marginBottom: 12,
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
  dialogContent: {
    padding: 20,
    minWidth: 300,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  dialogButton: {
    minWidth: 100,
  },
});

export default AdminModalities;
