
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Animated, Platform, ActivityIndicator } from 'react-native';
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
import { useAuth } from '../../contexts/AuthProvider';
import { useTheme } from '../../contexts/ThemeContext';
import { firestoreService, classService, studentService, announcementService } from '../../services/firestoreService';
import AnimatedCard from '../../components/AnimatedCard';
import AnimatedButton from '../../components/AnimatedButton';
import { useAnimation, ResponsiveUtils } from '../../utils/animations';

const InstructorDashboard = ({ navigation }) => {
  const { user, userProfile } = useAuth();
  const { getString } = useTheme();
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
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadAnnouncements();
    startEntryAnimation();
  }, []);

  // Carregar anúncios do Firestore
  const loadAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      const userAnnouncements = await announcementService.getActiveAnnouncements('instructor');
      
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
      console.error(getString('errorLoadingAnnouncements'), error);
      // Em caso de erro, exibe uma mensagem genérica
      setAnnouncements([{
        id: 'error',
        title: getString('errorLoadingData'),
        message: getString('couldNotLoadAnnouncements'),
        date: getString('now'),
        isError: true
      }]);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  // Função para formatar a data do anúncio
  const formatDate = (date) => {
    if (!date) return getString('unknownDate');
    
    try {
      const now = new Date();
      const announcementDate = date.toDate ? date.toDate() : new Date(date);
      const diffTime = Math.abs(now - announcementDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return getString('today');
      if (diffDays === 1) return getString('yesterday');
      if (diffDays < 7) return getString('daysAgo').replace('{days}', diffDays);
      
      return announcementDate.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error(getString('errorFormattingDate'), error);
      return getString('unknownDate');
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log(getString('loadingInstructorDashboard'), user.uid);
      
      // Buscar turmas do professor com tratamento de erro
      let instructorClasses = [];
      try {
        instructorClasses = await classService.getClassesByInstructor(user.uid, user?.email);
        console.log(getString('classesLoaded').replace('{count}', instructorClasses.length));
      } catch (classError) {
        console.warn(getString('errorSearchingClasses'), classError);
        try {
          instructorClasses = await firestoreService.getWhere('classes', 'instructorId', '==', user.uid);
          console.log(getString('fallbackClasses').replace('{count}', instructorClasses.length));
        } catch (fallbackError) {
          console.error(getString('fallbackClassesError'), fallbackError);
          instructorClasses = [];
        }
      }
      
      // Buscar alunos do professor com tratamento de erro
      let instructorStudents = [];
      try {
        instructorStudents = await studentService.getStudentsByInstructor(user.uid);
        console.log(getString('studentsLoaded').replace('{count}', instructorStudents.length));
      } catch (studentError) {
        console.warn(getString('errorSearchingStudents'), studentError);
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
      
      console.log(getString('instructorDashboardLoaded'));
    } catch (error) {
      console.error(getString('generalErrorLoadingDashboard'), error);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadDashboardData(),
      loadAnnouncements()
    ]);
    setRefreshing(false);
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
                    {getString('hello')}, {userProfile?.name?.split(' ')[0] || 'Professor'}! 👋
                  </Text>
                  <Text style={styles.roleText}>
                    {userProfile?.specialties?.join(' • ') || getString('martialArtsInstructor')}
                  </Text>
                  <View style={styles.statusBadge}>
                    <MaterialCommunityIcons name="circle" size={8} color="#4CAF50" />
                    <Text style={styles.statusText}>{getString('online')}</Text>
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
              <Text style={styles.statLabel}>{getString('myClasses')}</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.statGradient}
            >
              <MaterialCommunityIcons name="account-group" size={32} color="white" />
              <Text style={styles.statNumber}>{dashboardData.totalStudents}</Text>
              <Text style={styles.statLabel}>{getString('totalStudents')}</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.statGradient}
            >
              <MaterialCommunityIcons name="calendar-today" size={32} color="white" />
              <Text style={styles.statNumber}>{dashboardData.todayClasses.length}</Text>
              <Text style={styles.statLabel}>{getString('classesToday')}</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
            <LinearGradient
              colors={['#9C27B0', '#7B1FA2']}
              style={styles.statGradient}
            >
              <MaterialCommunityIcons name="check-circle" size={32} color="white" />
              <Text style={styles.statNumber}>{dashboardData.activeCheckIns}</Text>
              <Text style={styles.statLabel}>{getString('checkIns')}</Text>
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
                <Title style={styles.modernCardTitle}>{getString('todaySchedule')}</Title>
                <Text style={styles.modernCardSubtitle}>
                  {dashboardData.todayClasses.length} {getString('classesScheduled')}
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
                            {classItem.currentStudents || 0}/{classItem.maxCapacity || 'N/A'} {getString('students')}
                          </Text>
                        </View>
                      </View>
                      
                      <AnimatedButton 
                        mode="contained" 
                        onPress={() => navigation.navigate('Turmas', { classId: classItem.id })}
                        style={styles.timelineButton}
                        compact
                      >
                        {getString('manageClass')}
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
                <Text style={styles.emptyStateText}>{getString('noClassesToday')}</Text>
                <Text style={styles.emptyStateSubtext}>{getString('planNextClasses')}</Text>
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
                <Title style={styles.modernCardTitle}>{getString('quickActions')}</Title>
                <Text style={styles.modernCardSubtitle}>{getString('directAccessFunctionalities')}</Text>
              </View>
            </View>
            
            <View style={styles.modernQuickActions}>
              <Animated.View style={[styles.actionCard, { opacity: animations.fadeAnim }]}>
                <LinearGradient
                  colors={['#4CAF50', '#45A049']}
                  style={styles.actionGradient}
                >
                  <MaterialCommunityIcons name="plus-circle" size={28} color="white" />
                  <Text style={styles.actionTitle}>{getString('newClass')}</Text>
                  <Text style={styles.actionSubtitle}>{getString('createNewClass')}</Text>
                  <AnimatedButton
                    mode="contained"
                    onPress={() => navigation.navigate('NovaAula')}
                    style={styles.modernActionButton}
                    buttonColor="rgba(255,255,255,0.2)"
                    textColor="white"
                    compact
                  >
                    {getString('create')}
                  </AnimatedButton>
                </LinearGradient>
              </Animated.View>
              
              <Animated.View style={[styles.actionCard, { opacity: animations.fadeAnim }]}>
                <LinearGradient
                  colors={['#2196F3', '#1976D2']}
                  style={styles.actionGradient}
                >
                  <MaterialCommunityIcons name="qrcode-scan" size={28} color="white" />
                  <Text style={styles.actionTitle}>{getString('checkIn')}</Text>
                  <Text style={styles.actionSubtitle}>{getString('digitalAttendance')}</Text>
                  <AnimatedButton
                    mode="contained"
                    onPress={() => navigation.navigate('CheckIn')}
                    style={styles.modernActionButton}
                    buttonColor="rgba(255,255,255,0.2)"
                    textColor="white"
                    compact
                  >
                    {getString('open')}
                  </AnimatedButton>
                </LinearGradient>
              </Animated.View>
              
              <Animated.View style={[styles.actionCard, { opacity: animations.fadeAnim }]}>
                <LinearGradient
                  colors={['#9C27B0', '#7B1FA2']}
                  style={styles.actionGradient}
                >
                  <MaterialCommunityIcons name="chart-line" size={28} color="white" />
                  <Text style={styles.actionTitle}>{getString('reports')}</Text>
                  <Text style={styles.actionSubtitle}>{getString('dataAnalysis')}</Text>
                  <AnimatedButton
                    mode="contained"
                    onPress={() => navigation.navigate('Relatorios')}
                    style={styles.modernActionButton}
                    buttonColor="rgba(255,255,255,0.2)"
                    textColor="white"
                    compact
                  >
                    {getString('view')}
                  </AnimatedButton>
                </LinearGradient>
              </Animated.View>
            </View>
          </Card.Content>
        </AnimatedCard>

        {/* Avisos e Comunicados */}
        <AnimatedCard delay={350} style={styles.modernCard}>
          <Card.Content>
            <View style={styles.modernCardHeader}>
              <View style={styles.headerIconContainer}>
                <MaterialCommunityIcons name="bullhorn" size={24} color="#FF5722" />
              </View>
              <View style={styles.headerTitleContainer}>
                <Title style={styles.modernCardTitle}>{getString('announcements')}</Title>
                <Text style={styles.modernCardSubtitle}>{getString('importantCommunications')}</Text>
              </View>
              <AnimatedButton
                icon="refresh"
                mode="text"
                onPress={loadAnnouncements}
                loading={loadingAnnouncements}
                compact
                style={styles.refreshButton}
              >
                {loadingAnnouncements ? '' : getString('update')}
              </AnimatedButton>
            </View>
            
            {loadingAnnouncements ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingText}>{getString('loadingAnnouncements')}</Text>
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
                        <MaterialCommunityIcons name="alert-circle" size={16} color="#FFC107" />
                        <Text style={styles.priorityText}>{getString('important')}</Text>
                      </View>
                    )}
                    <Text style={styles.announcementTitle}>
                      {announcement.title}
                    </Text>
                    <Text style={styles.announcementMessage}>
                      {announcement.message}
                    </Text>
                    <View style={styles.announcementFooter}>
                      <Text style={styles.announcementDate}>
                        {announcement.date}
                      </Text>
                      {announcement.isRead && (
                        <MaterialCommunityIcons name="check-all" size={16} color="#4CAF50" />
                      )}
                    </View>
                    {index < announcements.length - 1 && <Divider style={styles.announcementDivider} />}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="bell-off-outline" size={48} color="#BDBDBD" />
                <Text style={styles.emptyStateText}>{getString('noAnnouncementsNow')}</Text>
                <Text style={styles.emptyStateSubtext}>{getString('notifyNewCommunications')}</Text>
              </View>
            )}
          </Card.Content>
        </AnimatedCard>

        {/* Graduações Recentes */}
        <AnimatedCard delay={400} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="trophy-outline" size={24} color="#FFD700" />
              <Title style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                {getString('recentGraduations')}
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
                {getString('noRecentGraduations')}
              </Paragraph>
            )}
            
            <AnimatedButton 
              mode="text" 
              onPress={() => {/* Implementar histórico completo */}}
              style={styles.viewAllButton}
            >
              {getString('viewAllGraduations')}
            </AnimatedButton>
          </Card.Content>
        </AnimatedCard>

        {/* Próximas Aulas */}
        <AnimatedCard delay={500} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar-outline" size={24} color="#FF9800" />
              <Title style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                {getString('upcomingClasses')}
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
                      : getString('scheduleNotDefined')}
                  </Text>
                  {index < dashboardData.upcomingClasses.length - 1 && (
                    <Divider style={styles.divider} />
                  )}
                </Animated.View>
              ))
            ) : (
              <Paragraph style={[styles.emptyText, { fontSize: ResponsiveUtils.fontSize.small }]}>
                {getString('noUpcomingClasses')}
              </Paragraph>
            )}
            
            <AnimatedButton 
              mode="outlined" 
              onPress={() => navigation.navigate('Turmas')}
              style={styles.viewAllButton}
            >
              {getString('viewAllClasses')}
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

  // Estilos para avisos
  headerTitleContainer: {
    flex: 1,
  },
  refreshButton: {
    margin: 0,
    padding: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: ResponsiveUtils.spacing.md,
  },
  loadingText: {
    marginTop: 8,
    color: '#757575',
    fontSize: ResponsiveUtils.fontSize.small,
  },
  announcementsContainer: {
    maxHeight: 400,
    marginTop: ResponsiveUtils.spacing.sm,
  },
  announcementItem: {
    paddingVertical: ResponsiveUtils.spacing.sm,
    position: 'relative',
  },
  highPriorityAnnouncement: {
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
    borderRadius: ResponsiveUtils.borderRadius.small,
    marginHorizontal: -ResponsiveUtils.spacing.sm,
    paddingHorizontal: ResponsiveUtils.spacing.sm,
    paddingTop: ResponsiveUtils.spacing.sm,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: ResponsiveUtils.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: ResponsiveUtils.spacing.xs,
  },
  priorityText: {
    fontSize: 12,
    color: '#FF8F00',
    marginLeft: 4,
    fontWeight: '500',
  },
  announcementTitle: {
    fontWeight: '600',
    color: '#333',
    marginBottom: ResponsiveUtils.spacing.xs,
    fontSize: ResponsiveUtils.fontSize.medium,
  },
  announcementMessage: {
    color: '#666',
    marginBottom: ResponsiveUtils.spacing.xs,
    fontSize: ResponsiveUtils.fontSize.small,
    lineHeight: 20,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: ResponsiveUtils.spacing.xs,
  },
  announcementDate: {
    color: '#999',
    fontSize: ResponsiveUtils.fontSize.small,
  },
  announcementDivider: {
    marginTop: ResponsiveUtils.spacing.md,
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
