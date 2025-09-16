import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Platform } from 'react-native';
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
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [deletingPlanIds, setDeletingPlanIds] = useState(new Set());
  const [deletingAnnouncementIds, setDeletingAnnouncementIds] = useState(new Set());
  
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
    
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔄 AdminModalities: Iniciando carregamento de dados...');
      setLoading(true);
      
      // Carregar dados de forma mais simples e robusta
      let modalitiesData = [];
      let plansData = [];
      let announcementsData = [];
      
      try {
        console.log('📋 Buscando modalidades...');
        modalitiesData = await firestoreService.getAll('modalities');
        console.log('✅ Modalidades carregadas:', modalitiesData?.length || 0);
      } catch (modalitiesError) {
        console.warn('⚠️ Erro ao carregar modalidades:', modalitiesError);
        modalitiesData = [];
      }
      
      try {
        console.log('💰 Buscando planos...');
        plansData = await firestoreService.getAll('plans');
        console.log('✅ Planos carregados:', plansData?.length || 0);
      } catch (plansError) {
        console.warn('⚠️ Erro ao carregar planos:', plansError);
        plansData = [];
      }
      
      try {
        console.log('📢 Buscando avisos...');
        announcementsData = await firestoreService.getAll('announcements');
        console.log('✅ Avisos carregados:', announcementsData?.length || 0);
      } catch (announcementsError) {
        console.warn('⚠️ Erro ao carregar avisos:', announcementsError);
        announcementsData = [];
      }
      
      // Atualizar estados
      setModalities(modalitiesData || []);
      setPlans(plansData || []);
      setAnnouncements(announcementsData || []);
      
      console.log('✅ AdminModalities: Carregamento concluído com sucesso!');
    } catch (error) {
      console.error('❌ Erro geral ao carregar dados:', error);
      
      // Garantir que sempre temos arrays vazios em caso de erro
      setModalities([]);
      setPlans([]);
      setAnnouncements([]);
    } finally {
      console.log('🏁 AdminModalities: Finalizando loading...');
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
    console.log('🗑️ handleDeleteModality chamado para:', modality);
    
    // Para web, usar window.confirm em vez de Alert.alert
    if (Platform.OS === 'web') {
      console.log('🌐 Usando window.confirm para web');
      const confirmed = window.confirm(`Tem certeza que deseja excluir a modalidade "${modality.name}"?`);
      
      if (confirmed) {
        console.log('✅ Usuário confirmou exclusão via window.confirm');
        executeDelete(modality);
      } else {
        console.log('❌ Exclusão cancelada pelo usuário via window.confirm');
      }
    } else {
      console.log('📱 Usando Alert.alert para mobile');
      Alert.alert(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir a modalidade "${modality.name}"?`,
        [
          { 
            text: 'Cancelar', 
            style: 'cancel',
            onPress: () => console.log('❌ Exclusão cancelada pelo usuário')
          },
          { 
            text: 'Excluir', 
            style: 'destructive',
            onPress: () => executeDelete(modality)
          }
        ]
      );
    }
  };

  // Função utilitária para mostrar notificações
  const showNotification = (message, type = 'success') => {
    if (Platform.OS === 'web') {
      // Adicionar animações CSS se não existirem
      if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      const notification = document.createElement('div');
      notification.innerHTML = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#F44336'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        animation: slideIn 0.3s ease-out;
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, type === 'success' ? 3000 : 4000);
    } else {
      Alert.alert(type === 'success' ? 'Sucesso' : 'Erro', message);
    }
  };

  const executeDelete = async (modality) => {
    console.log('✅ Executando exclusão da modalidade:', modality.name);
    
    // Adicionar ID à lista de itens sendo excluídos
    setDeletingIds(prev => new Set([...prev, modality.id]));
    
    try {
      console.log('=== DEBUG DELETE MODALITY ===');
      console.log('Modalidade ID:', modality.id);
      console.log('User UID:', user?.uid);
      console.log('User Type:', user?.userType);
      console.log('User Tipo:', user?.tipo);
      console.log('User Profile:', userProfile);
      console.log('================================');
      
      if (!modality.id) {
        throw new Error('ID da modalidade não encontrado');
      }
      
      console.log('🗑️ Iniciando exclusão da modalidade:', modality.id);
      await firestoreService.delete('modalities', modality.id);
      console.log('✅ Modalidade excluída do Firestore');
      
      // Atualizar lista local imediatamente
      setModalities(prev => prev.filter(m => m.id !== modality.id));
      console.log('✅ Lista local atualizada');
      
      showNotification('✅ Modalidade excluída com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro detalhado ao excluir modalidade:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      showNotification(`❌ Erro: ${error.message}`, 'error');
    } finally {
      // Remover ID da lista de itens sendo excluídos
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(modality.id);
        return newSet;
      });
    }
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
    console.log('🗑️ handleDeletePlan chamado para:', plan);
    
    // Para web, usar window.confirm em vez de Alert.alert
    if (Platform.OS === 'web') {
      console.log('🌐 Usando window.confirm para web');
      const confirmed = window.confirm(`Tem certeza que deseja excluir o plano "${plan.name}"?`);
      
      if (confirmed) {
        console.log('✅ Usuário confirmou exclusão via window.confirm');
        executeDeletePlan(plan);
      } else {
        console.log('❌ Exclusão cancelada pelo usuário via window.confirm');
      }
    } else {
      console.log('📱 Usando Alert.alert para mobile');
      Alert.alert(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir o plano "${plan.name}"?`,
        [
          { 
            text: 'Cancelar', 
            style: 'cancel',
            onPress: () => console.log('❌ Exclusão cancelada pelo usuário')
          },
          { 
            text: 'Excluir', 
            style: 'destructive',
            onPress: () => executeDeletePlan(plan)
          }
        ]
      );
    }
  };

  const executeDeletePlan = async (plan) => {
    console.log('✅ Executando exclusão do plano:', plan.name);
    
    // Adicionar ID à lista de itens sendo excluídos
    setDeletingPlanIds(prev => new Set([...prev, plan.id]));
    
    try {
      console.log('=== DEBUG DELETE PLAN ===');
      console.log('Plano ID:', plan.id);
      console.log('User UID:', user?.uid);
      console.log('================================');
      
      if (!plan.id) {
        throw new Error('ID do plano não encontrado');
      }
      
      console.log('🗑️ Iniciando exclusão do plano:', plan.id);
      await firestoreService.delete('plans', plan.id);
      console.log('✅ Plano excluído do Firestore');
      
      // Atualizar lista local imediatamente
      setPlans(prev => prev.filter(p => p.id !== plan.id));
      console.log('✅ Lista local atualizada');
      
      showNotification('✅ Plano excluído com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro detalhado ao excluir plano:', error);
      showNotification(`❌ Erro: ${error.message}`, 'error');
    } finally {
      // Remover ID da lista de itens sendo excluídos
      setDeletingPlanIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(plan.id);
        return newSet;
      });
    }
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
    console.log('🗑️ handleDeleteAnnouncement chamado para:', announcement);
    
    // Para web, usar window.confirm em vez de Alert.alert
    if (Platform.OS === 'web') {
      console.log('🌐 Usando window.confirm para web');
      const confirmed = window.confirm(`Tem certeza que deseja excluir o aviso "${announcement.title}"?`);
      
      if (confirmed) {
        console.log('✅ Usuário confirmou exclusão via window.confirm');
        executeDeleteAnnouncement(announcement);
      } else {
        console.log('❌ Exclusão cancelada pelo usuário via window.confirm');
      }
    } else {
      console.log('📱 Usando Alert.alert para mobile');
      Alert.alert(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir o aviso "${announcement.title}"?`,
        [
          { 
            text: 'Cancelar', 
            style: 'cancel',
            onPress: () => console.log('❌ Exclusão cancelada pelo usuário')
          },
          { 
            text: 'Excluir', 
            style: 'destructive',
            onPress: () => executeDeleteAnnouncement(announcement)
          }
        ]
      );
    }
  };

  const executeDeleteAnnouncement = async (announcement) => {
    console.log('✅ Executando exclusão do aviso:', announcement.title);
    
    // Adicionar ID à lista de itens sendo excluídos
    setDeletingAnnouncementIds(prev => new Set([...prev, announcement.id]));
    
    try {
      console.log('=== DEBUG DELETE ANNOUNCEMENT ===');
      console.log('Aviso ID:', announcement.id);
      console.log('User UID:', user?.uid);
      console.log('================================');
      
      if (!announcement.id) {
        throw new Error('ID do aviso não encontrado');
      }
      
      console.log('🗑️ Iniciando exclusão do aviso:', announcement.id);
      await firestoreService.delete('announcements', announcement.id);
      console.log('✅ Aviso excluído do Firestore');
      
      // Atualizar lista local imediatamente
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
      console.log('✅ Lista local atualizada');
      
      showNotification('✅ Aviso excluído com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro detalhado ao excluir aviso:', error);
      showNotification(`❌ Erro: ${error.message}`, 'error');
    } finally {
      // Remover ID da lista de itens sendo excluídos
      setDeletingAnnouncementIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(announcement.id);
        return newSet;
      });
    }
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando modalidades...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
                          onPress={() => {
                            console.log('🔴 Botão Excluir clicado para modalidade:', modality);
                            handleDeleteModality(modality);
                          }}
                          textColor={deletingIds.has(modality.id) ? "#999" : "#F44336"}
                          icon={deletingIds.has(modality.id) ? "loading" : "delete"}
                          compact
                          disabled={deletingIds.has(modality.id)}
                          loading={deletingIds.has(modality.id)}
                        >
                          {deletingIds.has(modality.id) ? 'Excluindo...' : 'Excluir'}
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
                          textColor={deletingPlanIds.has(plan.id) ? "#999" : "#F44336"}
                          icon={deletingPlanIds.has(plan.id) ? "loading" : "delete"}
                          compact
                          disabled={deletingPlanIds.has(plan.id)}
                          loading={deletingPlanIds.has(plan.id)}
                        >
                          {deletingPlanIds.has(plan.id) ? 'Excluindo...' : 'Excluir'}
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
                          textColor={deletingAnnouncementIds.has(announcement.id) ? "#999" : "#F44336"}
                          icon={deletingAnnouncementIds.has(announcement.id) ? "loading" : "delete"}
                          compact
                          disabled={deletingAnnouncementIds.has(announcement.id)}
                          loading={deletingAnnouncementIds.has(announcement.id)}
                        >
                          {deletingAnnouncementIds.has(announcement.id) ? 'Excluindo...' : 'Excluir'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
