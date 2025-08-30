import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Avatar,
  Chip,
  Divider,
  Text
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService, classService, paymentService, announcementService } from '../../services/firestoreService';

const StudentDashboard = ({ navigation }) => {
  const { user, userProfile, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    nextClasses: [],
    paymentStatus: null,
    recentAnnouncements: [],
    checkInAvailable: false
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar próximas aulas
      const userClasses = await Promise.all(
        (userProfile?.classIds || []).map(classId => 
          firestoreService.getById('classes', classId)
        )
      );
      
      // Buscar status de pagamento
      const payments = await paymentService.getPaymentsByStudent(user.uid);
      const latestPayment = payments[0];
      
      // Buscar avisos recentes
      const announcements = await announcementService.getActiveAnnouncements();
      
      // Verificar se há check-in disponível
      const now = new Date();
      const checkInAvailable = userClasses.some(classItem => {
        if (!classItem?.schedule) return false;
        
        // Lógica simplificada - verificar se há aula nas próximas 2 horas
        const today = now.getDay();
        const currentHour = now.getHours();
        
        return classItem.schedule.some(schedule => 
          schedule.dayOfWeek === today && 
          Math.abs(schedule.hour - currentHour) <= 2
        );
      });

      setDashboardData({
        nextClasses: userClasses.filter(Boolean).slice(0, 3),
        paymentStatus: latestPayment,
        recentAnnouncements: announcements.slice(0, 3),
        checkInAvailable
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleCheckIn = () => {
    // Implementar lógica de check-in
    console.log('Check-in realizado');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'overdue': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status?.status) {
      case 'paid': return 'Em dia';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Atrasado';
      default: return 'Não informado';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header com informações do usuário */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <Avatar.Text 
              size={60} 
              label={userProfile?.name?.charAt(0) || 'U'} 
              style={styles.avatar}
            />
            <View style={styles.headerText}>
              <Title style={styles.welcomeText}>
                Olá, {userProfile?.name?.split(' ')[0] || 'Usuário'}!
              </Title>
              <Paragraph style={styles.graduationText}>
                {userProfile?.currentGraduation || 'Iniciante'}
              </Paragraph>
            </View>
          </Card.Content>
        </Card>

        {/* Status de Pagamento */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="card-outline" size={24} color="#2196F3" />
              <Title style={styles.cardTitle}>Status do Pagamento</Title>
            </View>
            <View style={styles.paymentStatus}>
              <Chip 
                mode="outlined"
                style={[
                  styles.statusChip, 
                  { borderColor: getPaymentStatusColor(dashboardData.paymentStatus) }
                ]}
                textStyle={{ color: getPaymentStatusColor(dashboardData.paymentStatus) }}
              >
                {getPaymentStatusText(dashboardData.paymentStatus)}
              </Chip>
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('Pagamentos')}
                style={styles.paymentButton}
              >
                Ver Detalhes
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Check-in Rápido */}
        {dashboardData.checkInAvailable && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
                <Title style={styles.cardTitle}>Check-in Disponível</Title>
              </View>
              <Paragraph style={styles.checkInText}>
                Você tem uma aula começando em breve!
              </Paragraph>
              <Button 
                mode="contained" 
                onPress={handleCheckIn}
                style={styles.checkInButton}
                icon="check"
              >
                Fazer Check-in
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Próximas Aulas */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar-outline" size={24} color="#2196F3" />
              <Title style={styles.cardTitle}>Próximas Aulas</Title>
            </View>
            {dashboardData.nextClasses.length > 0 ? (
              dashboardData.nextClasses.map((classItem, index) => (
                <View key={index} style={styles.classItem}>
                  <Text style={styles.className}>{classItem.name}</Text>
                  <Text style={styles.classTime}>
                    {classItem.instructor} • {classItem.modality}
                  </Text>
                  {index < dashboardData.nextClasses.length - 1 && (
                    <Divider style={styles.divider} />
                  )}
                </View>
              ))
            ) : (
              <Paragraph>Nenhuma aula agendada</Paragraph>
            )}
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('Calendário')}
              style={styles.viewAllButton}
            >
              Ver Calendário Completo
            </Button>
          </Card.Content>
        </Card>

        {/* Avisos Recentes */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="notifications-outline" size={24} color="#FF9800" />
              <Title style={styles.cardTitle}>Avisos Recentes</Title>
            </View>
            {dashboardData.recentAnnouncements.length > 0 ? (
              dashboardData.recentAnnouncements.map((announcement, index) => (
                <View key={index} style={styles.announcementItem}>
                  <Text style={styles.announcementTitle}>{announcement.title}</Text>
                  <Text style={styles.announcementContent} numberOfLines={2}>
                    {announcement.content}
                  </Text>
                  {index < dashboardData.recentAnnouncements.length - 1 && (
                    <Divider style={styles.divider} />
                  )}
                </View>
              ))
            ) : (
              <Paragraph>Nenhum aviso recente</Paragraph>
            )}
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('Avisos')}
              style={styles.viewAllButton}
            >
              Ver Todos os Avisos
            </Button>
          </Card.Content>
        </Card>

        {/* Acesso Rápido */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Acesso Rápido</Title>
            <View style={styles.quickActions}>
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('Evolução')}
                style={styles.quickActionButton}
                icon="trending-up"
              >
                Minha Evolução
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('Pagamentos')}
                style={styles.quickActionButton}
                icon="credit-card"
              >
                Pagamentos
              </Button>
            </View>
            
            <View style={styles.logoutContainer}>
              <Button 
                mode="outlined" 
                onPress={handleLogout}
                style={styles.logoutButton}
                icon="logout"
                buttonColor="#FFEBEE"
                textColor="#F44336"
              >
                Sair
              </Button>
            </View>
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
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#2196F3',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 4,
  },
  graduationText: {
    color: '#666',
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 18,
  },
  paymentStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    borderWidth: 1,
  },
  paymentButton: {
    marginLeft: 8,
  },
  checkInText: {
    marginBottom: 12,
    color: '#666',
  },
  checkInButton: {
    backgroundColor: '#4CAF50',
  },
  classItem: {
    marginBottom: 8,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  classTime: {
    color: '#666',
    marginBottom: 8,
  },
  announcementItem: {
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  announcementContent: {
    color: '#666',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  viewAllButton: {
    marginTop: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  logoutContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  logoutButton: {
    width: '60%',
    borderColor: '#F44336',
  },
});

export default StudentDashboard;
