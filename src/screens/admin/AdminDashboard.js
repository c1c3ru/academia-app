import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Avatar,
  Chip,
  Divider,
  Text,
  Surface,
  List
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService, paymentService, announcementService } from '../../services/firestoreService';

const AdminDashboard = ({ navigation }) => {
  const { user, userProfile, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalClasses: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0,
    recentActivities: [],
    quickStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os alunos
      const students = await firestoreService.getAll('users');
      const activeStudents = students.filter(s => s.userType === 'student' && s.isActive !== false);
      
      // Buscar todas as turmas
      const classes = await firestoreService.getAll('classes');
      
      // Buscar pagamentos
      const payments = await firestoreService.getAll('payments');
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyPayments = payments.filter(p => {
        const paymentDate = new Date(p.createdAt.seconds ? p.createdAt.seconds * 1000 : p.createdAt);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      });
      
      const pendingPayments = payments.filter(p => p.status === 'pending').length;
      const overduePayments = payments.filter(p => p.status === 'overdue').length;
      
      const monthlyRevenue = monthlyPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      
      // Buscar atividades recentes (simulado)
      const recentActivities = [
        {
          type: 'new_student',
          message: 'Novo aluno cadastrado',
          time: '2 horas atrás',
          icon: 'person-add'
        },
        {
          type: 'payment',
          message: 'Pagamento recebido',
          time: '4 horas atrás',
          icon: 'card'
        },
        {
          type: 'graduation',
          message: 'Graduação registrada',
          time: '1 dia atrás',
          icon: 'trophy'
        }
      ];

      setDashboardData({
        totalStudents: students.filter(s => s.userType === 'student').length,
        activeStudents: activeStudents.length,
        totalClasses: classes.length,
        monthlyRevenue,
        pendingPayments,
        overduePayments,
        recentActivities,
        quickStats: {
          instructors: students.filter(s => s.userType === 'instructor').length,
          modalities: [...new Set(classes.map(c => c.modality))].length
        }
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard admin:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getActivityIcon = (type) => {
    const icons = {
      'new_student': 'person-add',
      'payment': 'card',
      'graduation': 'trophy',
      'class': 'school',
      'announcement': 'megaphone'
    };
    return icons[type] || 'information-circle';
  };

  const getActivityColor = (type) => {
    const colors = {
      'new_student': '#4CAF50',
      'payment': '#2196F3',
      'graduation': '#FFD700',
      'class': '#FF9800',
      'announcement': '#9C27B0'
    };
    return colors[type] || '#666';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header de Boas-vindas */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <Avatar.Text 
              size={60} 
              label={userProfile?.name?.charAt(0) || 'A'} 
              style={styles.avatar}
            />
            <View style={styles.headerText}>
              <Title style={styles.welcomeText}>
                Olá, {userProfile?.name?.split(' ')[0] || 'Admin'}!
              </Title>
              <Paragraph style={styles.roleText}>
                Administrador da Academia
              </Paragraph>
            </View>
          </Card.Content>
        </Card>

        {/* Estatísticas Principais */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics-outline" size={24} color="#2196F3" />
              <Title style={styles.cardTitle}>Visão Geral</Title>
            </View>
            
            <View style={styles.statsGrid}>
              <Surface style={styles.statItem}>
                <Text style={styles.statNumber}>{dashboardData.totalStudents}</Text>
                <Text style={styles.statLabel}>Total de Alunos</Text>
              </Surface>
              
              <Surface style={styles.statItem}>
                <Text style={styles.statNumber}>{dashboardData.activeStudents}</Text>
                <Text style={styles.statLabel}>Alunos Ativos</Text>
              </Surface>
              
              <Surface style={styles.statItem}>
                <Text style={styles.statNumber}>{dashboardData.totalClasses}</Text>
                <Text style={styles.statLabel}>Turmas</Text>
              </Surface>
              
              <Surface style={styles.statItem}>
                <Text style={styles.statNumber}>{dashboardData.quickStats.instructors}</Text>
                <Text style={styles.statLabel}>Professores</Text>
              </Surface>
            </View>
          </Card.Content>
        </Card>

        {/* Financeiro */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="cash-outline" size={24} color="#4CAF50" />
              <Title style={styles.cardTitle}>Financeiro do Mês</Title>
            </View>
            
            <View style={styles.financialInfo}>
              <View style={styles.revenueItem}>
                <Text style={styles.revenueLabel}>Receita do Mês</Text>
                <Text style={styles.revenueValue}>
                  {formatCurrency(dashboardData.monthlyRevenue)}
                </Text>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.paymentsRow}>
                <View style={styles.paymentItem}>
                  <Text style={styles.paymentNumber}>{dashboardData.pendingPayments}</Text>
                  <Text style={styles.paymentLabel}>Pendentes</Text>
                </View>
                
                <View style={styles.paymentItem}>
                  <Text style={[styles.paymentNumber, { color: '#F44336' }]}>
                    {dashboardData.overduePayments}
                  </Text>
                  <Text style={styles.paymentLabel}>Atrasados</Text>
                </View>
              </View>
            </View>
            
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('Relatórios')}
              style={styles.viewReportsButton}
              icon="chart-line"
            >
              Ver Relatórios Completos
            </Button>
          </Card.Content>
        </Card>

        {/* Ações Rápidas */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Ações Rápidas</Title>
            
            <View style={styles.quickActionsGrid}>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Alunos')}
                style={[styles.quickActionButton, { backgroundColor: '#2196F3' }]}
                icon="account"
                contentStyle={styles.quickActionContent}
              >
                Gerenciar Alunos
              </Button>
              
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Turmas')}
                style={[styles.quickActionButton, { backgroundColor: '#4CAF50' }]}
                icon="school"
                contentStyle={styles.quickActionContent}
              >
                Gerenciar Turmas
              </Button>
              
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Gestão')}
                style={[styles.quickActionButton, { backgroundColor: '#FF9800' }]}
                icon="settings"
                contentStyle={styles.quickActionContent}
              >
                Configurações
              </Button>
              
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Modalidades')}
                style={[styles.quickActionButton, { backgroundColor: '#9C27B0' }]}
                icon="fitness"
                contentStyle={styles.quickActionContent}
              >
                Modalidades
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

        {/* Atividades Recentes */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={24} color="#666" />
              <Title style={styles.cardTitle}>Atividades Recentes</Title>
            </View>
            
            {dashboardData.recentActivities.map((activity, index) => (
              <List.Item
                key={index}
                title={activity.message}
                description={activity.time}
                left={() => (
                  <List.Icon 
                    icon={getActivityIcon(activity.type)} 
                    color={getActivityColor(activity.type)}
                  />
                )}
              />
            ))}
            
            <Button 
              mode="text" 
              onPress={() => {/* Implementar histórico completo */}}
              style={styles.viewAllButton}
            >
              Ver Todas as Atividades
            </Button>
          </Card.Content>
        </Card>

        {/* Alertas e Notificações */}
        {(dashboardData.overduePayments > 0 || dashboardData.pendingPayments > 5) && (
          <Card style={[styles.card, styles.alertCard]}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="warning-outline" size={24} color="#FF9800" />
                <Title style={styles.cardTitle}>Alertas</Title>
              </View>
              
              {dashboardData.overduePayments > 0 && (
                <Paragraph style={styles.alertText}>
                  • {dashboardData.overduePayments} pagamento(s) em atraso
                </Paragraph>
              )}
              
              {dashboardData.pendingPayments > 5 && (
                <Paragraph style={styles.alertText}>
                  • Muitos pagamentos pendentes ({dashboardData.pendingPayments})
                </Paragraph>
              )}
            </Card.Content>
          </Card>
        )}
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
    backgroundColor: '#FF9800',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 4,
  },
  roleText: {
    color: '#666',
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  alertCard: {
    backgroundColor: '#FFF3E0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  financialInfo: {
    marginBottom: 16,
  },
  revenueItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  revenueLabel: {
    fontSize: 16,
    color: '#666',
  },
  revenueValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paymentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  paymentItem: {
    alignItems: 'center',
  },
  paymentNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  paymentLabel: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    marginVertical: 8,
  },
  viewReportsButton: {
    marginTop: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickActionButton: {
    width: '48%',
    marginBottom: 8,
  },
  quickActionContent: {
    height: 40,
  },
  logoutContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  logoutButton: {
    width: '60%',
    borderColor: '#F44336',
  },
  viewAllButton: {
    marginTop: 8,
  },
  alertText: {
    color: '#FF9800',
    marginBottom: 4,
  },
});

export default AdminDashboard;
