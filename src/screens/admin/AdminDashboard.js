import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  Avatar,
  Badge,
  Divider,
  Icon,
  ListItem
} from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
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
          icon: 'credit-card'
        },
        {
          type: 'graduation',
          message: 'Graduação registrada',
          time: '1 dia atrás',
          icon: 'emoji-events'
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
      'payment': 'credit-card',
      'graduation': 'emoji-events',
      'class': 'school',
      'announcement': 'campaign'
    };
    return icons[type] || 'info';
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
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header com informações do admin */}
        <Card containerStyle={styles.userCard}>
          <View style={styles.userHeader}>
            <Avatar 
              size={60} 
              title={userProfile?.name?.charAt(0) || 'A'}
              containerStyle={styles.avatar}
              titleStyle={styles.avatarText}
            />
            <View style={styles.userInfo}>
              <Text h3 style={styles.userName}>{userProfile?.name || 'Administrador'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Badge 
                value="Administrador"
                status="error"
                containerStyle={styles.userTypeChip}
                textStyle={styles.chipText}
              />
            </View>
          </View>
        </Card>

        {/* Estatísticas Principais */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="analytics" type="material" size={24} color="#2196F3" />
            <Text h4 style={styles.cardTitle}>Visão Geral</Text>
          </View>
            {/* Estatísticas Rápidas */}
            <View style={styles.statsContainer}>
              <Card containerStyle={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
                <Icon name="people" type="material" size={32} color="#2196F3" />
                <Text style={styles.statNumber}>{dashboardData.totalStudents}</Text>
                <Text style={styles.statLabel}>Total de Alunos</Text>
              </Card>
              
              <Card containerStyle={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
                <Icon name="fitness-center" type="material" size={32} color="#4CAF50" />
                <Text style={styles.statNumber}>{dashboardData.totalClasses}</Text>
                <Text style={styles.statLabel}>Turmas Ativas</Text>
              </Card>
              
              <Card containerStyle={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
                <Icon name="attach-money" type="material" size={32} color="#FF9800" />
                <Text style={styles.statNumber}>R$ {dashboardData.monthlyRevenue}</Text>
                <Text style={styles.statLabel}>Receita Mensal</Text>
              </Card>
              
              <Card containerStyle={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
                <Icon name="warning" type="material" size={32} color="#F44336" />
                <Text style={styles.statNumber}>{dashboardData.pendingPayments}</Text>
                <Text style={styles.statLabel}>Pagamentos Pendentes</Text>
              </Card>
            </View>
        </Card>

        {/* Financeiro */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="attach-money" type="material" size={24} color="#4CAF50" />
            <Text h4 style={styles.cardTitle}>Financeiro do Mês</Text>
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
              title="Ver Relatórios Completos"
              type="outline" 
              onPress={() => navigation.navigate('Relatórios')}
              buttonStyle={styles.viewReportsButton}
              icon={<Icon name="trending-up" type="material" size={20} color="#4CAF50" />}
            />
        </Card>

        {/* Ações Rápidas */}
        <Card containerStyle={styles.card}>
          <Text h4 style={styles.cardTitle}>Ações Rápidas</Text>
          
          <View style={styles.quickActionsGrid}>
            <Button 
              title="Gerenciar Alunos"
              onPress={() => navigation.navigate('Alunos')}
              buttonStyle={[styles.quickActionButton, { backgroundColor: '#2196F3' }]}
              icon={<Icon name="people" type="material" size={20} color="white" />}
            />
            
            <Button 
              title="Gerenciar Turmas"
              onPress={() => navigation.navigate('Turmas')}
              buttonStyle={[styles.quickActionButton, { backgroundColor: '#4CAF50' }]}
              icon={<Icon name="school" type="material" size={20} color="white" />}
            />
            
            <Button 
              title="Configurações"
              onPress={() => navigation.navigate('AdminSettings')}
              buttonStyle={[styles.quickActionButton, { backgroundColor: '#FF9800' }]}
              icon={<Icon name="settings" type="material" size={20} color="white" />}
            />
            
            <Button 
              title="Modalidades"
              onPress={() => navigation.navigate('Gestão')}
              buttonStyle={[styles.quickActionButton, { backgroundColor: '#9C27B0' }]}
              icon={<Icon name="fitness-center" type="material" size={20} color="white" />}
            />
          </View>
          
          <View style={styles.logoutContainer}>
            <Button 
              title="Sair"
              type="outline" 
              onPress={handleLogout}
              buttonStyle={styles.logoutButton}
              titleStyle={styles.logoutButtonText}
              icon={<Icon name="logout" type="material" size={20} color="#F44336" />}
            />
          </View>
        </Card>

        {/* Atividades Recentes */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="history" type="material" size={24} color="#666" />
            <Text h4 style={styles.cardTitle}>Atividades Recentes</Text>
          </View>
            
          {dashboardData.recentActivities.map((activity, index) => (
            <ListItem key={`activity-${index}`} bottomDivider>
              <Icon 
                name={getActivityIcon(activity.type)} 
                type="material"
                color={getActivityColor(activity.type)}
              />
              <ListItem.Content>
                <ListItem.Title>{activity.message}</ListItem.Title>
                <ListItem.Subtitle>{activity.time}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          ))}
          
          {dashboardData.recentActivities.length === 0 && (
            <Text style={styles.noActivities}>
              Nenhuma atividade recente
            </Text>
          )}
        </Card>

        {/* Alertas e Notificações */}
        {(dashboardData.overduePayments > 0 || dashboardData.pendingPayments > 5) && (
          <Card containerStyle={[styles.card, styles.alertCard]}>
            <View style={styles.cardHeader}>
              <Icon name="warning" type="material" size={24} color="#FF9800" />
              <Text h4 style={styles.cardTitle}>Alertas</Text>
            </View>
            
            {dashboardData.overduePayments > 0 && (
              <Text style={styles.alertText}>
                • {dashboardData.overduePayments} pagamento(s) em atraso
              </Text>
            )}
            
            {dashboardData.pendingPayments > 5 && (
              <Text style={styles.alertText}>
                • Muitos pagamentos pendentes ({dashboardData.pendingPayments})
              </Text>
            )}
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
  userCard: {
    margin: 16,
    marginBottom: 8,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userTypeChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 12,
  },
  avatar: {
    backgroundColor: '#FF9800',
  },
  avatarText: {
    color: 'white',
    fontWeight: '600',
  },
  card: {
    margin: 16,
    marginTop: 8,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  financialInfo: {
    marginTop: 16,
  },
  revenueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  revenueLabel: {
    fontSize: 16,
    color: '#333',
  },
  revenueValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paymentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
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
    marginTop: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionButton: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
  },
  noActivities: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 16,
  },
  viewReportsButton: {
    marginTop: 16,
  },
  viewAllButton: {
    marginTop: 12,
  },
  logoutContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  logoutButton: {
    borderColor: '#F44336',
    borderRadius: 25,
  },
  logoutButtonText: {
    color: '#F44336',
  },
  alertText: {
    fontSize: 14,
    color: '#FF9800',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
});

export default AdminDashboard;
