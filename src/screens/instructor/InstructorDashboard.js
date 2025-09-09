
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService, classService, studentService } from '../../services/firestoreService';
import AnimatedCard from '../../components/AnimatedCard';
import AnimatedButton from '../../components/AnimatedButton';
import { useAnimation, ResponsiveUtils } from '../../utils/animations';

const InstructorDashboard = ({ navigation }) => {
  const { user, userProfile } = useAuth();
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
      console.log('📊 Carregando dashboard do instrutor:', user.uid);
      
      // Buscar turmas do professor com tratamento de erro
      let instructorClasses = [];
      try {
        instructorClasses = await classService.getClassesByInstructor(user.uid, user?.email);
        console.log(`✅ ${instructorClasses.length} turmas carregadas`);
      } catch (classError) {
        console.warn('⚠️ Erro ao buscar turmas via service:', classError);
        try {
          instructorClasses = await firestoreService.getWhere('classes', 'instructorId', '==', user.uid);
          console.log(`✅ Fallback: ${instructorClasses.length} turmas encontradas`);
        } catch (fallbackError) {
          console.error('❌ Falha no fallback para turmas:', fallbackError);
          instructorClasses = [];
        }
      }
      
      // Buscar alunos do professor com tratamento de erro
      let instructorStudents = [];
      try {
        instructorStudents = await studentService.getStudentsByInstructor(user.uid);
        console.log(`✅ ${instructorStudents.length} alunos carregados`);
      } catch (studentError) {
        console.warn('⚠️ Erro ao buscar alunos via service:', studentError);
        instructorStudents = [];
      }
      
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
      
      console.log('✅ Dashboard do instrutor carregado com sucesso');
    } catch (error) {
      console.error('Erro geral ao carregar dashboard do professor:', error);
      // Em caso de erro total, definir dados vazios para evitar crash
      setDashboardData({
        myClasses: [],
        todayClasses: [],
        totalStudents: 0,
        activeCheckIns: 0,
        recentGraduations: [],
        upcomingClasses: []
      });
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
        {/* Header Moderno com Gradiente */}
        <Animated.View style={[headerTransform]}>
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={['#4CAF50', '#45A049', '#388E3C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <Animated.View
                  style={{
                    transform: [{ scale: animations.scaleAnim }],
                  }}
                >
                  <Avatar.Text 
                    size={ResponsiveUtils.isTablet() ? 85 : 65} 
                    label={userProfile?.name?.charAt(0) || 'P'} 
                    style={styles.avatar}
                  />
                </Animated.View>
                <View style={styles.headerText}>
                  <Text style={styles.welcomeText}>
                    Olá, {userProfile?.name?.split(' ')[0] || 'Professor'}! 👋
                  </Text>
                  <Text style={styles.roleText}>
                    {userProfile?.specialties?.join(' • ') || 'Instrutor de Artes Marciais'}
                  </Text>
                  <View style={styles.statusBadge}>
                    <MaterialCommunityIcons name="circle" size={8} color="#4CAF50" />
                    <Text style={styles.statusText}>Online</Text>
                  </View>
                </View>
                <Animated.View style={{ opacity: animations.fadeAnim }}>
                  <MaterialCommunityIcons 
                    name="account-star" 
                    size={24} 
                    color="rgba(255,255,255,0.8)" 
                  />
                </Animated.View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Cards de Estatísticas Modernos */}
        <View style={styles.statsContainer}>
          <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
            <LinearGradient
              colors={['#4CAF50', '#45A049']}
              style={styles.statGradient}
            >
              <MaterialCommunityIcons name="school-outline" size={32} color="white" />
              <Text style={styles.statNumber}>{dashboardData.myClasses.length}</Text>
              <Text style={styles.statLabel}>Minhas Turmas</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.statGradient}
            >
              <MaterialCommunityIcons name="account-group" size={32} color="white" />
              <Text style={styles.statNumber}>{dashboardData.totalStudents}</Text>
              <Text style={styles.statLabel}>Total Alunos</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.statGradient}
            >
              <MaterialCommunityIcons name="calendar-today" size={32} color="white" />
              <Text style={styles.statNumber}>{dashboardData.todayClasses.length}</Text>
              <Text style={styles.statLabel}>Aulas Hoje</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
            <LinearGradient
              colors={['#9C27B0', '#7B1FA2']}
              style={styles.statGradient}
            >
              <MaterialCommunityIcons name="check-circle" size={32} color="white" />
              <Text style={styles.statNumber}>{dashboardData.activeCheckIns}</Text>
              <Text style={styles.statLabel}>Check-ins</Text>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Timeline de Aulas Hoje */}
        <AnimatedCard delay={200} style={styles.modernCard}>
          <Card.Content>
            <View style={styles.modernCardHeader}>
              <View style={styles.headerIconContainer}>
                <MaterialCommunityIcons name="clock-time-four" size={24} color="#2196F3" />
              </View>
              <View>
                <Title style={styles.modernCardTitle}>Agenda de Hoje</Title>
                <Text style={styles.modernCardSubtitle}>
                  {dashboardData.todayClasses.length} aula(s) programada(s)
                </Text>
              </View>
            </View>
            
            {dashboardData.todayClasses.length > 0 ? (
              <View style={styles.timelineContainer}>
                {dashboardData.todayClasses.map((classItem, index) => (
                  <Animated.View 
                    key={index} 
                    style={[
                      styles.timelineItem,
                      { opacity: animations.fadeAnim }
                    ]}
                  >
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeader}>
                        <Text style={styles.timelineTitle}>{classItem.name}</Text>
                        <Chip 
                          mode="flat" 
                          style={styles.modernChip}
                          textStyle={styles.chipText}
                        >
                          {classItem.modality}
                        </Chip>
                      </View>
                      
                      <View style={styles.timelineDetails}>
                        <View style={styles.timelineInfo}>
                          <MaterialCommunityIcons name="clock" size={16} color="#666" />
                          <Text style={styles.timelineText}>
                            {classItem.schedule?.map(s => 
                              `${formatTime(s.hour, s.minute)}`
                            ).join(', ')}
                          </Text>
                        </View>
                        
                        <View style={styles.timelineInfo}>
                          <MaterialCommunityIcons name="account-multiple" size={16} color="#666" />
                          <Text style={styles.timelineText}>
                            {classItem.currentStudents || 0}/{classItem.maxCapacity || 'N/A'} alunos
                          </Text>
                        </View>
                      </View>
                      
                      <AnimatedButton 
                        mode="contained" 
                        onPress={() => navigation.navigate('Turmas', { classId: classItem.id })}
                        style={styles.timelineButton}
                        compact
                      >
                        Gerenciar Aula
                      </AnimatedButton>
                    </View>
                    {index < dashboardData.todayClasses.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </Animated.View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="calendar-blank" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>Nenhuma aula hoje</Text>
                <Text style={styles.emptyStateSubtext}>Aproveite para planejar suas próximas aulas</Text>
              </View>
            )}
          </Card.Content>
        </AnimatedCard>

        {/* Ações Rápidas Modernizadas */}
        <AnimatedCard delay={300} style={styles.modernCard}>
          <Card.Content>
            <View style={styles.modernCardHeader}>
              <View style={styles.headerIconContainer}>
                <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FF9800" />
              </View>
              <View>
                <Title style={styles.modernCardTitle}>Ações Rápidas</Title>
                <Text style={styles.modernCardSubtitle}>Acesso direto às principais funcionalidades</Text>
              </View>
            </View>
            
            <View style={styles.modernQuickActions}>
              <Animated.View style={[styles.actionCard, { opacity: animations.fadeAnim }]}>
                <LinearGradient
                  colors={['#4CAF50', '#45A049']}
                  style={styles.actionGradient}
                >
                  <MaterialCommunityIcons name="plus-circle" size={28} color="white" />
                  <Text style={styles.actionTitle}>Nova Aula</Text>
                  <Text style={styles.actionSubtitle}>Criar nova turma</Text>
                  <AnimatedButton
                    mode="contained"
                    onPress={() => navigation.navigate('NovaAula')}
                    style={styles.modernActionButton}
                    buttonColor="rgba(255,255,255,0.2)"
                    textColor="white"
                    compact
                  >
                    Criar
                  </AnimatedButton>
                </LinearGradient>
              </Animated.View>
              
              <Animated.View style={[styles.actionCard, { opacity: animations.fadeAnim }]}>
                <LinearGradient
                  colors={['#2196F3', '#1976D2']}
                  style={styles.actionGradient}
                >
                  <MaterialCommunityIcons name="qrcode-scan" size={28} color="white" />
                  <Text style={styles.actionTitle}>Check-in</Text>
                  <Text style={styles.actionSubtitle}>Presença digital</Text>
                  <AnimatedButton
                    mode="contained"
                    onPress={() => navigation.navigate('CheckIn')}
                    style={styles.modernActionButton}
                    buttonColor="rgba(255,255,255,0.2)"
                    textColor="white"
                    compact
                  >
                    Abrir
                  </AnimatedButton>
                </LinearGradient>
              </Animated.View>
              
              <Animated.View style={[styles.actionCard, { opacity: animations.fadeAnim }]}>
                <LinearGradient
                  colors={['#9C27B0', '#7B1FA2']}
                  style={styles.actionGradient}
                >
                  <MaterialCommunityIcons name="chart-line" size={28} color="white" />
                  <Text style={styles.actionTitle}>Relatórios</Text>
                  <Text style={styles.actionSubtitle}>Análise de dados</Text>
                  <AnimatedButton
                    mode="contained"
                    onPress={() => navigation.navigate('Relatorios')}
                    style={styles.modernActionButton}
                    buttonColor="rgba(255,255,255,0.2)"
                    textColor="white"
                    compact
                  >
                    Ver
                  </AnimatedButton>
                </LinearGradient>
              </Animated.View>
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
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  // Header moderno
  headerContainer: {
    margin: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.lg,
    borderRadius: ResponsiveUtils.borderRadius.large,
    overflow: 'hidden',
    ...ResponsiveUtils.elevation,
  },
  headerGradient: {
    padding: ResponsiveUtils.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerText: {
    marginLeft: ResponsiveUtils.spacing.md,
    flex: 1,
  },
  welcomeText: {
    fontSize: ResponsiveUtils.fontSize.large,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  roleText: {
    fontSize: ResponsiveUtils.fontSize.medium,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  
  // Cards de estatísticas modernos
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.md,
  },
  statCard: {
    width: '48%',
    marginBottom: ResponsiveUtils.spacing.md,
    borderRadius: ResponsiveUtils.borderRadius.medium,
    overflow: 'hidden',
    ...ResponsiveUtils.elevation,
  },
  statGradient: {
    padding: ResponsiveUtils.spacing.md,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 4,
  },
  
  // Cards modernos
  modernCard: {
    margin: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.md,
    borderRadius: ResponsiveUtils.borderRadius.large,
    ...ResponsiveUtils.elevation,
  },
  modernCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.md,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ResponsiveUtils.spacing.md,
  },
  modernCardTitle: {
    fontSize: ResponsiveUtils.fontSize.large,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  modernCardSubtitle: {
    fontSize: ResponsiveUtils.fontSize.small,
    color: '#666',
  },
  
  // Ações rápidas modernizadas
  modernQuickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: ResponsiveUtils.spacing.sm,
    borderRadius: ResponsiveUtils.borderRadius.medium,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: ResponsiveUtils.spacing.md,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'space-between',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  modernActionButton: {
    borderRadius: 20,
  },
  
  // Timeline
  timelineContainer: {
    marginTop: ResponsiveUtils.spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: ResponsiveUtils.spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginTop: 6,
    marginRight: ResponsiveUtils.spacing.md,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: ResponsiveUtils.borderRadius.medium,
    padding: ResponsiveUtils.spacing.md,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineTitle: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  modernChip: {
    backgroundColor: '#e3f2fd',
  },
  chipText: {
    fontSize: 12,
    color: '#1976d2',
  },
  timelineDetails: {
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  timelineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  timelineButton: {
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 18,
    bottom: -ResponsiveUtils.spacing.md,
    width: 2,
    backgroundColor: '#e0e0e0',
  },
  
  // Estados vazios
  emptyState: {
    alignItems: 'center',
    padding: ResponsiveUtils.spacing.xl,
  },
  emptyStateText: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: 'bold',
    color: '#666',
    marginTop: ResponsiveUtils.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: ResponsiveUtils.fontSize.small,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  
  // Estilos legados mantidos para compatibilidade
  card: {
    margin: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.sm,
    borderRadius: ResponsiveUtils.borderRadius.medium,
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
    marginBottom: ResponsiveUtils.spacing.xs,
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
