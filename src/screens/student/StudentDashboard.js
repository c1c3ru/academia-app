
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions, ActivityIndicator, Text } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Chip, 
  Divider,
  List,
  Avatar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthProvider';
import { announcementService } from '../../services/firestoreService';
import AnimatedCard from '../../components/AnimatedCard';
import AnimatedButton from '../../components/AnimatedButton';
import { ResponsiveUtils } from '../../utils/animations';
import { Ionicons } from '@expo/vector-icons';

const StudentDashboard = () => {
  const { userProfile } = useAuth();
  const [nextClasses, setNextClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // Carregar anúncios do Firestore
  const loadAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      const userAnnouncements = await announcementService.getActiveAnnouncements('student');
      
      // Formatar dados para exibição
      const formattedAnnouncements = userAnnouncements.map(announcement => ({
        id: announcement.id,
        title: announcement.title,
        message: announcement.message,
        date: formatDate(announcement.createdAt),
        priority: announcement.priority || 0
      }));
      
      setAnnouncements(formattedAnnouncements);
    } catch (error) {
      console.error('Erro ao carregar anúncios:', error);
      // Em caso de erro, exibe uma mensagem genérica
      setAnnouncements([{
        id: 'error',
        title: 'Erro ao carregar',
        message: 'Não foi possível carregar os avisos. Tente novamente mais tarde.',
        date: 'Agora',
        isError: true
      }]);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  // Função para formatar a data do anúncio
  const formatDate = (date) => {
    if (!date) return 'Data desconhecida';
    
    try {
      const now = new Date();
      const announcementDate = date.toDate ? date.toDate() : new Date(date);
      const diffTime = Math.abs(now - announcementDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Hoje';
      if (diffDays === 1) return 'Ontem';
      if (diffDays < 7) return `Há ${diffDays} dias`;
      
      return announcementDate.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data desconhecida';
    }
  };

  useEffect(() => {
    // Simular dados para demonstração
    setNextClasses([
      {
        id: 1,
        name: 'Karate Básico',
        time: '18:00',
        date: 'Hoje',
        instructor: 'Prof. João',
      },
      {
        id: 2,
        name: 'Jiu-Jitsu',
        time: '19:30',
        date: 'Amanhã',
        instructor: 'Prof. Maria',
      },
    ]);

    // Carregar anúncios reais do Firestore
    loadAnnouncements();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header de Boas-vindas */}
        <AnimatedCard style={styles.welcomeCard} animationType="fadeIn" delay={0}>
          <Card.Content style={styles.welcomeContent}>
            <Avatar.Icon 
              size={ResponsiveUtils?.isTablet?.() ? 80 : 60} 
              icon="account" 
              style={styles.avatar}
            />
            <View style={styles.welcomeText}>
              <Title style={styles.welcomeTitle}>
                Olá, {userProfile?.name || 'Aluno'}!
              </Title>
              <Paragraph style={styles.welcomeSubtitle}>
                Bem-vindo de volta à academia
              </Paragraph>
            </View>
          </Card.Content>
        </AnimatedCard>

        {/* Status da Graduação */}
        <AnimatedCard style={styles.card} animationType="slideInRight" delay={100}>
          <Card.Content>
            <Title style={styles.cardTitle}>Status da Graduação</Title>
            <View style={styles.graduationStatus}>
              <Chip 
                icon="trophy" 
                mode="outlined"
                style={styles.graduationChip}
              >
                Faixa Branca
              </Chip>
              <Paragraph style={styles.graduationText}>
                Próxima avaliação em 2 meses
              </Paragraph>
            </View>
          </Card.Content>
        </AnimatedCard>

        {/* Próximas Aulas */}
        <AnimatedCard style={styles.card} animationType="fadeIn" delay={200}>
          <Card.Content>
            <Title style={styles.cardTitle}>Próximas Aulas</Title>
            {nextClasses.length > 0 ? (
              nextClasses.map((classItem, index) => (
                <List.Item
                  key={classItem.id}
                  title={classItem.name}
                  description={`${classItem.date} às ${classItem.time} - ${classItem.instructor}`}
                  left={props => <List.Icon {...props} icon="calendar" />}
                  style={styles.listItem}
                />
              ))
            ) : (
              <Paragraph style={styles.emptyText}>
                Nenhuma aula agendada
              </Paragraph>
            )}
            
            <AnimatedButton 
              mode="text" 
              onPress={() => Alert.alert('Info', 'Funcionalidade em desenvolvimento')}
              style={styles.viewAllButton}
            >
              Ver Calendário Completo
            </AnimatedButton>
          </Card.Content>
        </AnimatedCard>

        {/* Avisos e Comunicados */}
        <AnimatedCard style={styles.card} animationType="scaleIn" delay={300}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.cardTitle}>Avisos</Title>
              <AnimatedButton
                icon="refresh"
                mode="text"
                onPress={loadAnnouncements}
                loading={loadingAnnouncements}
                compact
                style={styles.refreshButton}
              >
                {loadingAnnouncements ? '' : 'Atualizar'}
              </AnimatedButton>
            </View>
            
            {loadingAnnouncements ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#2196F3" />
                <Paragraph style={styles.loadingText}>Carregando avisos...</Paragraph>
              </View>
            ) : announcements.length > 0 ? (
              <View style={styles.announcementsContainer}>
                {announcements.map((announcement, index) => (
                  <View 
                    key={announcement.id} 
                    style={[
                      styles.announcementItem,
                      announcement.priority > 0 && styles.highPriorityAnnouncement
                    ]}
                  >
                    {announcement.priority > 0 && (
                      <View style={styles.priorityBadge}>
                        <Ionicons name="alert-circle" size={16} color="#FFC107" />
                        <Text style={styles.priorityText}>Importante</Text>
                      </View>
                    )}
                    <Paragraph style={styles.announcementTitle}>
                      {announcement.title}
                    </Paragraph>
                    <Paragraph style={styles.announcementMessage}>
                      {announcement.message}
                    </Paragraph>
                    <View style={styles.announcementFooter}>
                      <Text style={styles.announcementDate}>
                        {announcement.date}
                      </Text>
                      {announcement.isRead && (
                        <Ionicons name="checkmark-done" size={16} color="#4CAF50" />
                      )}
                    </View>
                    {index < announcements.length - 1 && <Divider style={styles.announcementDivider} />}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={48} color="#BDBDBD" />
                <Paragraph style={styles.emptyText}>
                  Nenhum aviso no momento
                </Paragraph>
              </View>
            )}
          </Card.Content>
        </AnimatedCard>

        {/* Ações Rápidas */}
        <AnimatedCard style={styles.card} animationType="bounceIn" delay={400}>
          <Card.Content>
            <Title style={styles.cardTitle}>Ações Rápidas</Title>
            <View style={styles.quickActions}>
              <AnimatedButton
                mode="outlined"
                icon="calendar-check"
                onPress={() => Alert.alert('Info', 'Check-in em desenvolvimento')}
                style={styles.quickActionButton}
              >
                Check-in
              </AnimatedButton>
              
              <AnimatedButton
                mode="outlined"
                icon="credit-card"
                onPress={() => Alert.alert('Info', 'Pagamentos em desenvolvimento')}
                style={styles.quickActionButton}
              >
                Pagamentos
              </AnimatedButton>
            </View>
          </Card.Content>
        </AnimatedCard>

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
    padding: ResponsiveUtils?.spacing?.sm || 8,
    paddingBottom: ResponsiveUtils?.spacing?.xl || 32,
  },
  welcomeCard: {
    marginBottom: ResponsiveUtils?.spacing?.sm || 8,
    backgroundColor: '#2196F3',
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  welcomeText: {
    marginLeft: ResponsiveUtils?.spacing?.md || 16,
    flex: 1,
  },
  welcomeTitle: {
    color: 'white',
    fontSize: ResponsiveUtils?.fontSize?.large || 20,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: ResponsiveUtils?.fontSize?.small || 14,
  },
  card: {
    marginBottom: ResponsiveUtils?.spacing?.sm || 8,
  },
  cardTitle: {
    fontSize: ResponsiveUtils?.fontSize?.large || 18,
    fontWeight: '600',
    marginBottom: ResponsiveUtils?.spacing?.md || 12,
    color: '#2196F3',
  },
  graduationStatus: {
    alignItems: 'center',
  },
  graduationChip: {
    marginBottom: ResponsiveUtils?.spacing?.sm || 8,
  },
  graduationText: {
    textAlign: 'center',
    color: '#666',
  },
  emptyText: {
    color: '#757575',
    textAlign: 'center',
    marginVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    color: '#757575',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  refreshButton: {
    margin: 0,
    padding: 0,
  },
  announcementsContainer: {
    maxHeight: 400,
  },
  announcementItem: {
    paddingVertical: 12,
    position: 'relative',
  },
  highPriorityAnnouncement: {
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
    borderRadius: 8,
    marginHorizontal: -8,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  priorityText: {
    fontSize: 12,
    color: '#FF8F00',
    marginLeft: 4,
    fontWeight: '500',
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  announcementTitle: {
    fontWeight: '600',
    color: '#333',
    marginBottom: ResponsiveUtils?.spacing?.xs || 4,
  },
  announcementMessage: {
    color: '#666',
    marginBottom: ResponsiveUtils?.spacing?.xs || 4,
  },
  announcementDate: {
    color: '#999',
    fontSize: ResponsiveUtils?.fontSize?.small || 12,
  },
  announcementDivider: {
    marginTop: ResponsiveUtils?.spacing?.md || 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: ResponsiveUtils?.spacing?.sm || 8,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: ResponsiveUtils?.spacing?.xs || 4,
  },
});

export default StudentDashboard;
