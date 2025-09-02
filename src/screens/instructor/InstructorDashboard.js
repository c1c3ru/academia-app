
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Animated, Platform } from 'react-native';
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
import { firestoreService, classService, studentService } from '../../services/firestoreService';
import AnimatedCard from '../../components/AnimatedCard';
import AnimatedButton from '../../components/AnimatedButton';
import { useAnimation, ResponsiveUtils } from '../../utils/animations';

const InstructorDashboard = ({ navigation }) => {
  const { user, userProfile, logout } = useAuth();
  const { animations, startEntryAnimation } = useAnimation();
  const scrollY = new Animated.Value(0);
  
  const [dashboardData, setDashboardData] = useState({
    myClasses: [],
    todayClasses: [],
    totalStudents: 0,
    activeCheckIns: 0,
    recentGraduations: [],
    upcomingClasses: []
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
      
      // Buscar turmas do professor
      const instructorClasses = await classService.getClassesByInstructor(user.uid);
      
      // Buscar alunos do professor
      const instructorStudents = await studentService.getStudentsByInstructor(user.uid);
      
      // Filtrar aulas de hoje
      const today = new Date().getDay();
      const todayClasses = instructorClasses.filter(classItem => 
        classItem.schedule?.some(s => s.dayOfWeek === today)
      );
      
      // Buscar check-ins ativos (simulado)
      const activeCheckIns = 0; // Implementar lógica real
      
      // Graduações recentes (simulado)
      const recentGraduations = [
        {
          studentName: 'João Silva',
          graduation: 'Faixa Azul',
          modality: 'Jiu-Jitsu',
          date: new Date()
        }
      ];
      
      // Próximas aulas
      const upcomingClasses = instructorClasses.slice(0, 3);

      setDashboardData({
        myClasses: instructorClasses,
        todayClasses,
        totalStudents: instructorStudents.length,
        activeCheckIns,
        recentGraduations,
        upcomingClasses
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard do professor:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const formatTime = (hour, minute = 0) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const getDayName = (dayNumber) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[dayNumber] || 'N/A';
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
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
        {/* Header do Professor */}
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
                  label={userProfile?.name?.charAt(0) || 'P'} 
                  style={styles.avatar}
                />
              </Animated.View>
              <View style={styles.headerText}>
                <Title style={[styles.welcomeText, { fontSize: ResponsiveUtils.fontSize.large }]}>
                  Professor {userProfile?.name?.split(' ')[0] || 'Usuário'}
                </Title>
                <Paragraph style={[styles.roleText, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                  {userProfile?.specialties?.join(', ') || 'Instrutor'}
                </Paragraph>
              </View>
            </Card.Content>
          </AnimatedCard>
        </Animated.View>

        {/* Estatísticas Rápidas */}
        <AnimatedCard delay={100} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics-outline" size={24} color="#4CAF50" />
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
                    {dashboardData.myClasses.length}
                  </Text>
                  <Text style={[styles.statLabel, { fontSize: ResponsiveUtils.fontSize.small }]}>
                    Minhas Turmas
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
                    {dashboardData.totalStudents}
                  </Text>
                  <Text style={[styles.statLabel, { fontSize: ResponsiveUtils.fontSize.small }]}>
                    Total Alunos
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
                    {dashboardData.todayClasses.length}
                  </Text>
                  <Text style={[styles.statLabel, { fontSize: ResponsiveUtils.fontSize.small }]}>
                    Aulas Hoje
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
                    {dashboardData.activeCheckIns}
                  </Text>
                  <Text style={[styles.statLabel, { fontSize: ResponsiveUtils.fontSize.small }]}>
                    Check-ins Ativos
                  </Text>
                </Surface>
              </Animated.View>
            </View>
          </Card.Content>
        </AnimatedCard>

        {/* Aulas de Hoje */}
        <AnimatedCard delay={200} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="today-outline" size={24} color="#2196F3" />
              <Title style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                Aulas de Hoje
              </Title>
            </View>
            
            {dashboardData.todayClasses.length > 0 ? (
              dashboardData.todayClasses.map((classItem, index) => (
                <Animated.View 
                  key={index} 
                  style={[
                    styles.classItem,
                    {
                      opacity: animations.fadeAnim,
                      transform: [{
                        translateY: animations.slideAnim.interpolate({
                          inputRange: [-50, 0],
                          outputRange: [-20, 0],
                        })
                      }]
                    }
                  ]}
                >
                  <View style={styles.classHeader}>
                    <Text style={[styles.className, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                      {classItem.name}
                    </Text>
                    <Chip mode="outlined" style={styles.modalityChip}>
                      {classItem.modality}
                    </Chip>
                  </View>
                  
                  <View style={styles.classDetails}>
                    <Text style={[styles.classTime, { fontSize: ResponsiveUtils.fontSize.small }]}>
                      {classItem.schedule?.map(s => 
                        `${getDayName(s.dayOfWeek)} ${formatTime(s.hour, s.minute)}`
                      ).join(', ')}
                    </Text>
                    <Text style={[styles.classCapacity, { fontSize: ResponsiveUtils.fontSize.small }]}>
                      Capacidade: {classItem.currentStudents || 0}/{classItem.maxCapacity || 'N/A'}
                    </Text>
                  </View>
                  
                  <AnimatedButton 
                    mode="outlined" 
                    onPress={() => navigation.navigate('Turmas', { classId: classItem.id })}
                    style={styles.classButton}
                    icon="eye"
                  >
                    Ver Detalhes
                  </AnimatedButton>
                  
                  {index < dashboardData.todayClasses.length - 1 && (
                    <Divider style={styles.divider} />
                  )}
                </Animated.View>
              ))
            ) : (
              <Paragraph style={[styles.emptyText, { fontSize: ResponsiveUtils.fontSize.small }]}>
                Nenhuma aula agendada para hoje
              </Paragraph>
            )}
          </Card.Content>
        </AnimatedCard>

        {/* Ações Rápidas */}
        <AnimatedCard delay={300} style={styles.card}>
          <Card.Content>
            <Title style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
              Ações Rápidas
            </Title>
            
            <View style={styles.quickActions}>
              <AnimatedButton 
                mode="contained" 
                onPress={() => navigation.navigate('Turmas')}
                style={[styles.quickActionButton, { backgroundColor: '#4CAF50' }]}
                icon="school"
              >
                Minhas Turmas
              </AnimatedButton>
              
              <AnimatedButton 
                mode="contained" 
                onPress={() => navigation.navigate('Alunos')}
                style={[styles.quickActionButton, { backgroundColor: '#2196F3' }]}
                icon="account"
              >
                Meus Alunos
              </AnimatedButton>
            </View>
            
            <View style={styles.quickActions}>
              <AnimatedButton 
                mode="outlined" 
                onPress={() => {/* Implementar graduação rápida */}}
                style={styles.quickActionButton}
                icon="trophy"
              >
                Registrar Graduação
              </AnimatedButton>
              
              <AnimatedButton 
                mode="outlined" 
                onPress={() => {/* Implementar check-in */}}
                style={styles.quickActionButton}
                icon="check"
              >
                Ver Check-ins
              </AnimatedButton>
            </View>
            
            <View style={styles.logoutContainer}>
              <AnimatedButton 
                mode="outlined" 
                onPress={handleLogout}
                style={styles.logoutButton}
                icon="logout"
                buttonColor="#FFEBEE"
                textColor="#F44336"
              >
                Sair
              </AnimatedButton>
            </View>
          </Card.Content>
        </AnimatedCard>

        {/* Graduações Recentes */}
        <AnimatedCard delay={400} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="trophy-outline" size={24} color="#FFD700" />
              <Title style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                Graduações Recentes
              </Title>
            </View>
            
            {dashboardData.recentGraduations.length > 0 ? (
              dashboardData.recentGraduations.map((graduation, index) => (
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
                    title={`${graduation.studentName} - ${graduation.graduation}`}
                    description={`${graduation.modality} • ${graduation.date.toLocaleDateString('pt-BR')}`}
                    titleStyle={{ fontSize: ResponsiveUtils.fontSize.medium }}
                    descriptionStyle={{ fontSize: ResponsiveUtils.fontSize.small }}
                    left={() => <List.Icon icon="trophy" color="#FFD700" />}
                  />
                </Animated.View>
              ))
            ) : (
              <Paragraph style={[styles.emptyText, { fontSize: ResponsiveUtils.fontSize.small }]}>
                Nenhuma graduação recente
              </Paragraph>
            )}
            
            <AnimatedButton 
              mode="text" 
              onPress={() => {/* Implementar histórico completo */}}
              style={styles.viewAllButton}
            >
              Ver Todas as Graduações
            </AnimatedButton>
          </Card.Content>
        </AnimatedCard>

        {/* Próximas Aulas */}
        <AnimatedCard delay={500} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar-outline" size={24} color="#FF9800" />
              <Title style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                Próximas Aulas
              </Title>
            </View>
            
            {dashboardData.upcomingClasses.length > 0 ? (
              dashboardData.upcomingClasses.map((classItem, index) => (
                <Animated.View 
                  key={index} 
                  style={[
                    styles.upcomingClass,
                    {
                      opacity: animations.fadeAnim,
                      transform: [{
                        translateY: animations.slideAnim.interpolate({
                          inputRange: [-50, 0],
                          outputRange: [-15, 0],
                        })
                      }]
                    }
                  ]}
                >
                  <Text style={[styles.upcomingClassName, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                    {classItem.name}
                  </Text>
                  <Text style={[styles.upcomingClassInfo, { fontSize: ResponsiveUtils.fontSize.small }]}>
                    {classItem.modality} • {classItem.schedule?.[0] ? 
                      `${getDayName(classItem.schedule[0].dayOfWeek)} ${formatTime(classItem.schedule[0].hour)}` 
                      : 'Horário não definido'}
                  </Text>
                  {index < dashboardData.upcomingClasses.length - 1 && (
                    <Divider style={styles.divider} />
                  )}
                </Animated.View>
              ))
            ) : (
              <Paragraph style={[styles.emptyText, { fontSize: ResponsiveUtils.fontSize.small }]}>
                Nenhuma aula próxima
              </Paragraph>
            )}
            
            <AnimatedButton 
              mode="outlined" 
              onPress={() => navigation.navigate('Turmas')}
              style={styles.viewAllButton}
            >
              Ver Todas as Turmas
            </AnimatedButton>
          </Card.Content>
        </AnimatedCard>
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
    backgroundColor: '#4CAF50',
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
    color: '#4CAF50',
  },
  statLabel: {
    color: '#666',
    marginTop: ResponsiveUtils.spacing.xs,
    textAlign: 'center',
  },
  classItem: {
    marginBottom: ResponsiveUtils.spacing.md,
    padding: ResponsiveUtils.spacing.sm,
    backgroundColor: '#f9f9f9',
    borderRadius: ResponsiveUtils.borderRadius.small,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  className: {
    fontWeight: 'bold',
    flex: 1,
  },
  modalityChip: {
    marginLeft: ResponsiveUtils.spacing.sm,
  },
  classDetails: {
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  classTime: {
    color: '#666',
    marginBottom: ResponsiveUtils.spacing.xs,
  },
  classCapacity: {
    color: '#666',
  },
  classButton: {
    marginTop: ResponsiveUtils.spacing.sm,
  },
  quickActions: {
    flexDirection: ResponsiveUtils.isTablet() ? 'row' : 'column',
    justifyContent: 'space-between',
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  quickActionButton: {
    flex: ResponsiveUtils.isTablet() ? 1 : undefined,
    marginHorizontal: ResponsiveUtils.isTablet() ? ResponsiveUtils.spacing.xs : 0,
    marginBottom: ResponsiveUtils.isTablet() ? 0 : ResponsiveUtils.spacing.sm,
  },
  logoutContainer: {
    marginTop: ResponsiveUtils.spacing.lg,
    alignItems: 'center',
  },
  logoutButton: {
    width: ResponsiveUtils.isTablet() ? '40%' : '60%',
    borderColor: '#F44336',
  },
  upcomingClass: {
    marginBottom: ResponsiveUtils.spacing.sm,
    padding: ResponsiveUtils.spacing.sm,
    backgroundColor: '#fff3e0',
    borderRadius: ResponsiveUtils.borderRadius.small,
  },
  upcomingClassName: {
    fontWeight: 'bold',
    marginBottom: ResponsiveUtils.spacing.xs,
  },
  upcomingClassInfo: {
    color: '#666',
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: ResponsiveUtils.spacing.md,
  },
  divider: {
    marginVertical: ResponsiveUtils.spacing.sm,
  },
  viewAllButton: {
    marginTop: ResponsiveUtils.spacing.sm,
  },
});

export default InstructorDashboard;
