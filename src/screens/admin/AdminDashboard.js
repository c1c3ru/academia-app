import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions, Platform, TouchableOpacity } from 'react-native';
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
import { LinearGradient } from 'expo-linear-gradient';
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
      {/* Header com Gradiente */}
      <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.userSection}>
            <LinearGradient colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']} style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {userProfile?.name?.charAt(0) || 'A'}
              </Text>
            </LinearGradient>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userProfile?.name || 'Administrador'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.userBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#fff" />
                <Text style={styles.badgeText}>Administrador</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* Cards de Estatísticas */}
        <View style={styles.statsCardsContainer}>
          <View style={styles.statsRow}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={[styles.statCardModern, { flex: 1 }]}>
              <View style={styles.statCardHeader}>
                <Ionicons name="people" size={20} color="#fff" />
                <Text style={styles.statCardTitle}>Alunos</Text>
              </View>
              <Text style={styles.statValue}>{dashboardData.totalStudents}</Text>
              <TouchableOpacity style={styles.statCardButton} onPress={() => navigation.navigate('Alunos')}>
                <Text style={styles.statCardButtonText}>Ver Todos</Text>
                <Ionicons name="arrow-forward" size={12} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            
            <LinearGradient colors={['#f093fb', '#f5576c']} style={[styles.statCardModern, { flex: 1 }]}>
              <View style={styles.statCardHeader}>
                <Ionicons name="school" size={20} color="#fff" />
                <Text style={styles.statCardTitle}>Turmas</Text>
              </View>
              <Text style={styles.statValue}>{dashboardData.totalClasses}</Text>
              <TouchableOpacity style={styles.statCardButton} onPress={() => navigation.navigate('Turmas')}>
                <Text style={styles.statCardButtonText}>Gerenciar</Text>
                <Ionicons name="arrow-forward" size={12} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
          
          <View style={styles.statsRow}>
            <LinearGradient colors={['#4facfe', '#00f2fe']} style={[styles.statCardModern, { flex: 1 }]}>
              <View style={styles.statCardHeader}>
                <Ionicons name="cash" size={20} color="#fff" />
                <Text style={styles.statCardTitle}>Receita</Text>
              </View>
              <Text style={[styles.statValue, { fontSize: 18 }]}>{formatCurrency(dashboardData.monthlyRevenue)}</Text>
              <TouchableOpacity style={styles.statCardButton} onPress={() => navigation.navigate('Relatórios')}>
                <Text style={styles.statCardButtonText}>Relatórios</Text>
                <Ionicons name="arrow-forward" size={12} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            
            <LinearGradient colors={['#fa709a', '#fee140']} style={[styles.statCardModern, { flex: 1 }]}>
              <View style={styles.statCardHeader}>
                <Ionicons name="warning" size={20} color="#fff" />
                <Text style={styles.statCardTitle}>Pendentes</Text>
              </View>
              <Text style={styles.statValue}>{dashboardData.pendingPayments}</Text>
              <TouchableOpacity style={styles.statCardButton}>
                <Text style={styles.statCardButtonText}>Verificar</Text>
                <Ionicons name="arrow-forward" size={12} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        {/* Resumo Financeiro */}
        <Card containerStyle={styles.modernCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Resumo Financeiro</Text>
          </View>
          
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.financialCard}>
            <View style={styles.financialHeader}>
              <Ionicons name="trending-up" size={24} color="#fff" />
              <Text style={styles.financialTitle}>Receita do Mês</Text>
            </View>
            <Text style={styles.financialValue}>{formatCurrency(dashboardData.monthlyRevenue)}</Text>
            <View style={styles.financialStats}>
              <View style={styles.financialStatItem}>
                <Text style={styles.financialStatNumber}>{dashboardData.pendingPayments}</Text>
                <Text style={styles.financialStatLabel}>Pendentes</Text>
              </View>
              <View style={styles.financialStatItem}>
                <Text style={[styles.financialStatNumber, { color: '#FFE082' }]}>{dashboardData.overduePayments}</Text>
                <Text style={styles.financialStatLabel}>Atrasados</Text>
              </View>
            </View>
          </LinearGradient>
          
          <TouchableOpacity style={styles.viewAllButtonModern} onPress={() => navigation.navigate('Relatórios')}>
            <Ionicons name="bar-chart" size={16} color="#667eea" />
            <Text style={[styles.viewAllButtonText, { color: '#667eea' }]}>Ver Relatórios Completos</Text>
            <Ionicons name="chevron-forward" size={16} color="#667eea" />
          </TouchableOpacity>
        </Card>

        {/* Ações Rápidas */}
        <Card containerStyle={styles.modernCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={24} color="#FF9800" />
            <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          </View>
          
          <View style={styles.quickActionsGrid}>
            <View style={styles.quickActionsRow}>
              <TouchableOpacity style={styles.quickActionCardModern} onPress={() => navigation.navigate('Alunos')}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.quickActionGradient}>
                  <Ionicons name="people" size={28} color="#fff" />
                  <Text style={styles.quickActionText}>Alunos</Text>
                  <Text style={styles.quickActionCount}>{dashboardData.totalStudents} total</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionCardModern} onPress={() => navigation.navigate('Turmas')}>
                <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.quickActionGradient}>
                  <Ionicons name="school" size={28} color="#fff" />
                  <Text style={styles.quickActionText}>Turmas</Text>
                  <Text style={styles.quickActionCount}>{dashboardData.totalClasses} ativas</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <View style={styles.quickActionsRow}>
              <TouchableOpacity style={styles.quickActionCardModern} onPress={() => navigation.navigate('AdminSettings')}>
                <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.quickActionGradient}>
                  <Ionicons name="settings" size={28} color="#fff" />
                  <Text style={styles.quickActionText}>Configurações</Text>
                  <Text style={styles.quickActionCount}>Sistema</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionCardModern} onPress={() => navigation.navigate('Gestão')}>
                <LinearGradient colors={['#fa709a', '#fee140']} style={styles.quickActionGradient}>
                  <Ionicons name="fitness" size={28} color="#fff" />
                  <Text style={styles.quickActionText}>Modalidades</Text>
                  <Text style={styles.quickActionCount}>{dashboardData.quickStats.modalities} tipos</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity style={styles.logoutButtonModern} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#F44336" />
            <Text style={styles.logoutButtonTextModern}>Sair</Text>
          </TouchableOpacity>
        </Card>

        {/* Atividades Recentes */}
        <Card containerStyle={styles.modernCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={24} color="#9C27B0" />
            <Text style={styles.sectionTitle}>Atividades Recentes</Text>
          </View>
          
          <View style={styles.activitiesList}>
            {dashboardData.recentActivities.map((activity, index) => (
              <LinearGradient 
                key={`activity-${activity.id || activity.type}-${index}-${activity.timestamp || Date.now()}`}
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']} 
                style={styles.activityCard}
              >
                <View style={styles.activityIconContainer}>
                  <Ionicons 
                    name={getActivityIcon(activity.type)} 
                    size={20} 
                    color={getActivityColor(activity.type)} 
                  />
                </View>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityMessage}>{activity.message}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </LinearGradient>
            ))}
            
            {dashboardData.recentActivities.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nenhuma atividade recente</Text>
                <Text style={styles.emptySubtext}>As atividades aparecerão aqui conforme acontecem</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Alertas e Notificações */}
        {(dashboardData.overduePayments > 0 || dashboardData.pendingPayments > 5) && (
          <Card containerStyle={styles.modernCard}>
            <LinearGradient colors={['#FFE082', '#FFCC02']} style={styles.alertGradient}>
              <View style={styles.alertHeader}>
                <Ionicons name="warning" size={24} color="#F57F17" />
                <Text style={styles.alertTitle}>Alertas Importantes</Text>
              </View>
              
              <View style={styles.alertsList}>
                {dashboardData.overduePayments > 0 && (
                  <View style={styles.alertItem}>
                    <Ionicons name="alert-circle" size={16} color="#F57F17" />
                    <Text style={styles.alertText}>
                      {dashboardData.overduePayments} pagamento(s) em atraso
                    </Text>
                  </View>
                )}
                
                {dashboardData.pendingPayments > 5 && (
                  <View style={styles.alertItem}>
                    <Ionicons name="alert-circle" size={16} color="#F57F17" />
                    <Text style={styles.alertText}>
                      Muitos pagamentos pendentes ({dashboardData.pendingPayments})
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  userEmail: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  notificationIcon: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statsCardsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCardModern: {
    padding: 20,
    borderRadius: 16,
    minHeight: 120,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  statCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statCardButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginRight: 4,
  },
  modernCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  financialCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  financialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  financialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  financialValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
  },
  financialStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  financialStatItem: {
    alignItems: 'center',
  },
  financialStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  financialStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  quickActionsGrid: {
    gap: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quickActionCardModern: {
    flex: 1,
  },
  quickActionGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
  activitiesList: {
    gap: 12,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  alertGradient: {
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F57F17',
    marginLeft: 8,
  },
  alertsList: {
    gap: 8,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57F17',
    marginLeft: 8,
  },
  viewAllButtonModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  logoutButtonModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
    marginTop: 20,
  },
  logoutButtonTextModern: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 8,
  },
});

export default AdminDashboard;
