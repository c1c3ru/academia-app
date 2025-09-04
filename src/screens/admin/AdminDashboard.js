
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Animated, Dimensions, Platform } from 'react-native';
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
import AnimatedCard from '../../components/AnimatedCard';
import AnimatedButton from '../../components/AnimatedButton';
import { useAnimation, ResponsiveUtils } from '../../utils/animations';

const AdminDashboard = ({ navigation }) => {
  const { user, userProfile, logout } = useAuth();
  const { animations, startEntryAnimation } = useAnimation();
  const scrollY = new Animated.Value(0);
  
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
    startEntryAnimation();
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

  const headerTransform = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 100],
          outputRange: [0, -20],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: Platform.OS !== 'web' }
        )}
        scrollEventThrottle={16}
      >
        {/* Header de Boas-vindas */}
        <Animated.View style={[headerTransform]}>
          <AnimatedCard delay={0} style={styles.headerCard}>
            <Card.Content style={styles.headerContent}>
              <Animated.View
                style={{
                  transform: [{ scale: animations.scaleAnim }],
                }}
              >
                <Avatar.Text 
                  size={ResponsiveUtils.isTablet() ? 80 : 60} 
                  label={userProfile?.name?.charAt(0) || 'A'} 
                  style={styles.avatar}
                />
              </Animated.View>
              <View style={styles.headerText}>
                <Title style={[styles.welcomeText, { fontSize: ResponsiveUtils.fontSize.large }]}>
                  Olá, {userProfile?.name?.split(' ')[0] || 'Admin'}!
                </Title>
                <Paragraph style={[styles.roleText, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                  Administrador da Academia
                </Paragraph>
              </View>
            </Card.Content>
          </AnimatedCard>
        </Animated.View>

        {/* Estatísticas Principais */}
        <AnimatedCard delay={100} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics-outline" size={24} color="#2196F3" />
              <Title style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                Visão Geral
              </Title>
            </View>
            
            <View style={styles.statsGrid}>
              <Animated.View
                style={{
                  opacity: animations.fadeAnim,
                  transform: [{ scale: animations.scaleAnim }],
                }}
              >
                <Surface style={styles.statItem}>
                  <Text style={[styles.statNumber, { fontSize: ResponsiveUtils.fontSize.extraLarge }]}>
                    {dashboardData.totalStudents}
                  </Text>
                  <Text style={[styles.statLabel, { fontSize: ResponsiveUtils.fontSize.small }]}>
                    Total de Alunos
                  </Text>
                </Surface>
              </Animated.View>
              
              <Animated.View
                style={{
                  opacity: animations.fadeAnim,
                  transform: [{ scale: animations.scaleAnim }],
                }}
              >
                <Surface style={styles.statItem}>
                  <Text style={[styles.statNumber, { fontSize: ResponsiveUtils.fontSize.extraLarge }]}>
                    {dashboardData.activeStudents}
                  </Text>
                  <Text style={[styles.statLabel, { fontSize: ResponsiveUtils.fontSize.small }]}>
                    Alunos Ativos
                  </Text>
                </Surface>
              </Animated.View>
              
              <Animated.View
                style={{
                  opacity: animations.fadeAnim,
                  transform: [{ scale: animations.scaleAnim }],
                }}
              >
                <Surface style={styles.statItem}>
                  <Text style={[styles.statNumber, { fontSize: ResponsiveUtils.fontSize.extraLarge }]}>
                    {dashboardData.totalClasses}
                  </Text>
                  <Text style={[styles.statLabel, { fontSize: ResponsiveUtils.fontSize.small }]}>
                    Turmas
                  </Text>
                </Surface>
              </Animated.View>
              
              <Animated.View
                style={{
                  opacity: animations.fadeAnim,
                  transform: [{ scale: animations.scaleAnim }],
                }}
              >
                <Surface style={styles.statItem}>
                  <Text style={[styles.statNumber, { fontSize: ResponsiveUtils.fontSize.extraLarge }]}>
                    {dashboardData.quickStats.instructors}
                  </Text>
                  <Text style={[styles.statLabel, { fontSize: ResponsiveUtils.fontSize.small }]}>
                    Professores
                  </Text>
                </Surface>
              </Animated.View>
            </View>
          </Card.Content>
        </AnimatedCard>

        {/* Financeiro */}
        <AnimatedCard delay={200} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="cash-outline" size={24} color="#4CAF50" />
              <Title style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                Financeiro do Mês
              </Title>
            </View>
            
            <View style={styles.financialInfo}>
              <Animated.View 
                style={[
                  styles.revenueItem,
                  {
                    opacity: animations.fadeAnim,
                    transform: [{ translateY: animations.slideAnim }],
                  }
                ]}
              >
                <Text style={[styles.revenueLabel, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                  Receita do Mês
                </Text>
                <Text style={[styles.revenueValue, { fontSize: ResponsiveUtils.fontSize.extraLarge }]}>
                  {formatCurrency(dashboardData.monthlyRevenue)}
                </Text>
              </Animated.View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.paymentsRow}>
                <View style={styles.paymentItem}>
                  <Text style={[styles.paymentNumber, { fontSize: ResponsiveUtils.fontSize.large }]}>
                    {dashboardData.pendingPayments}
                  </Text>
                  <Text style={[styles.paymentLabel, { fontSize: ResponsiveUtils.fontSize.small }]}>
                    Pendentes
                  </Text>
                </View>
                
                <View style={styles.paymentItem}>
                  <Text style={[
                    styles.paymentNumber, 
                    { 
                      color: '#F44336',
                      fontSize: ResponsiveUtils.fontSize.large 
                    }
                  ]}>
                    {dashboardData.overduePayments}
                  </Text>
                  <Text style={[styles.paymentLabel, { fontSize: ResponsiveUtils.fontSize.small }]}>
                    Atrasados
                  </Text>
                </View>
              </View>
            </View>
            
            <AnimatedButton 
              mode="outlined" 
              onPress={() => navigation.navigate('Gestão')}
              style={styles.viewReportsButton}
              icon="chart-line"
            >
              Acessar Gestão e Relatórios
            </AnimatedButton>
          </Card.Content>
        </AnimatedCard>

        {/* Ações Rápidas */}
        <AnimatedCard delay={300} style={styles.card}>
          <Card.Content>
            <Title style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
              Ações Rápidas
            </Title>
            
            <View style={styles.quickActionsGrid}>
              <AnimatedButton 
                mode="contained" 
                onPress={() => navigation.navigate('Alunos')}
                style={[styles.quickActionButton, { backgroundColor: '#2196F3' }]}
                icon="account"
                contentStyle={styles.quickActionContent}
              >
                Gerenciar Alunos
              </AnimatedButton>
              
              <AnimatedButton 
                mode="contained" 
                onPress={() => navigation.navigate('Turmas')}
                style={[styles.quickActionButton, { backgroundColor: '#4CAF50' }]}
                icon="school"
                contentStyle={styles.quickActionContent}
              >
                Gerenciar Turmas
              </AnimatedButton>
              
              <AnimatedButton 
                mode="contained" 
                onPress={() => navigation.navigate('Gestão')}
                style={[styles.quickActionButton, { backgroundColor: '#FF9800' }]}
                icon="settings"
                contentStyle={styles.quickActionContent}
              >
                Configurações
              </AnimatedButton>
              
              <AnimatedButton 
                mode="contained" 
                onPress={() => navigation.navigate('Modalidades')}
                style={[styles.quickActionButton, { backgroundColor: '#9C27B0' }]}
                icon="fitness"
                contentStyle={styles.quickActionContent}
              >
                Modalidades
              </AnimatedButton>
            </View>
          </Card.Content>
        </AnimatedCard>

        {/* Atividades Recentes */}
        <AnimatedCard delay={400} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={24} color="#666" />
              <Title style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                Atividades Recentes
              </Title>
            </View>
            
            {dashboardData.recentActivities.map((activity, index) => (
              <Animated.View
                key={index}
                style={{
                  opacity: animations.fadeAnim,
                  transform: [{
                    translateX: animations.slideAnim.interpolate({
                      inputRange: [-50, 0],
                      outputRange: [-30, 0],
                    })
                  }]
                }}
              >
                <List.Item
                  title={activity.message}
                  description={activity.time}
                  titleStyle={{ fontSize: ResponsiveUtils.fontSize.medium }}
                  descriptionStyle={{ fontSize: ResponsiveUtils.fontSize.small }}
                  left={() => (
                    <List.Icon 
                      icon={getActivityIcon(activity.type)} 
                      color={getActivityColor(activity.type)}
                    />
                  )}
                />
              </Animated.View>
            ))}
            
            <AnimatedButton 
              mode="text" 
              onPress={() => {/* Implementar histórico completo */}}
              style={styles.viewAllButton}
            >
              Ver Todas as Atividades
            </AnimatedButton>
          </Card.Content>
        </AnimatedCard>

        {/* Alertas e Notificações */}
        {(dashboardData.overduePayments > 0 || dashboardData.pendingPayments > 5) && (
          <AnimatedCard delay={500} style={[styles.card, styles.alertCard]}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="warning-outline" size={24} color="#FF9800" />
                <Title style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                  Alertas
                </Title>
              </View>
              
              {dashboardData.overduePayments > 0 && (
                <Paragraph style={[styles.alertText, { fontSize: ResponsiveUtils.fontSize.small }]}>
                  • {dashboardData.overduePayments} pagamento(s) em atraso
                </Paragraph>
              )}
              
              {dashboardData.pendingPayments > 5 && (
                <Paragraph style={[styles.alertText, { fontSize: ResponsiveUtils.fontSize.small }]}>
                  • Muitos pagamentos pendentes ({dashboardData.pendingPayments})
                </Paragraph>
              )}
            </Card.Content>
          </AnimatedCard>
        )}
      </Animated.ScrollView>
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
    margin: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.sm,
    ...ResponsiveUtils.elevation,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ResponsiveUtils.spacing.md,
  },
  avatar: {
    backgroundColor: '#FF9800',
  },
  headerText: {
    marginLeft: ResponsiveUtils.spacing.md,
    flex: 1,
  },
  welcomeText: {
    fontWeight: 'bold',
    marginBottom: ResponsiveUtils.spacing.xs,
  },
  roleText: {
    color: '#666',
  },
  card: {
    margin: ResponsiveUtils.spacing.md,
    marginTop: ResponsiveUtils.spacing.sm,
    ...ResponsiveUtils.elevation,
  },
  alertCard: {
    backgroundColor: '#FFF3E0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.md,
  },
  cardTitle: {
    marginLeft: ResponsiveUtils.spacing.sm,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: ResponsiveUtils.isTablet() ? '23%' : '48%',
    alignItems: 'center',
    padding: ResponsiveUtils.spacing.md,
    borderRadius: ResponsiveUtils.borderRadius.medium,
    ...ResponsiveUtils.elevation,
    backgroundColor: '#fff',
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    color: '#666',
    marginTop: ResponsiveUtils.spacing.xs,
    textAlign: 'center',
  },
  financialInfo: {
    marginBottom: ResponsiveUtils.spacing.md,
  },
  revenueItem: {
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.md,
    padding: ResponsiveUtils.spacing.md,
    backgroundColor: '#E8F5E8',
    borderRadius: ResponsiveUtils.borderRadius.medium,
  },
  revenueLabel: {
    color: '#666',
  },
  revenueValue: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: ResponsiveUtils.spacing.xs,
  },
  paymentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: ResponsiveUtils.spacing.md,
  },
  paymentItem: {
    alignItems: 'center',
    padding: ResponsiveUtils.spacing.sm,
    backgroundColor: '#f9f9f9',
    borderRadius: ResponsiveUtils.borderRadius.small,
    flex: 1,
    marginHorizontal: ResponsiveUtils.spacing.xs,
  },
  paymentNumber: {
    fontWeight: 'bold',
    color: '#FF9800',
  },
  paymentLabel: {
    color: '#666',
    marginTop: ResponsiveUtils.spacing.xs,
  },
  divider: {
    marginVertical: ResponsiveUtils.spacing.sm,
  },
  viewReportsButton: {
    marginTop: ResponsiveUtils.spacing.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: ResponsiveUtils.spacing.sm,
  },
  quickActionButton: {
    width: ResponsiveUtils.isTablet() ? '48%' : '48%',
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  quickActionContent: {
    height: ResponsiveUtils.isTablet() ? 50 : 40,
    paddingHorizontal: ResponsiveUtils.spacing.sm,
  },
  
  viewAllButton: {
    marginTop: ResponsiveUtils.spacing.sm,
  },
  alertText: {
    color: '#FF9800',
    marginBottom: ResponsiveUtils.spacing.xs,
  },
});

export default AdminDashboard;
