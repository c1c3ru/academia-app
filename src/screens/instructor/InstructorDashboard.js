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
  Text,
  Surface,
  List
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService, classService, studentService } from '../../services/firestoreService';

const InstructorDashboard = ({ navigation }) => {
  const { user, userProfile, logout } = useAuth();
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header do Professor */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <Avatar.Text 
              size={60} 
              label={userProfile?.name?.charAt(0) || 'P'} 
              style={styles.avatar}
            />
            <View style={styles.headerText}>
              <Title style={styles.welcomeText}>
                Professor {userProfile?.name?.split(' ')[0] || 'Usuário'}
              </Title>
              <Paragraph style={styles.roleText}>
                {userProfile?.specialties?.join(', ') || 'Instrutor'}
              </Paragraph>
            </View>
          </Card.Content>
        </Card>

        {/* Estatísticas Rápidas */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics-outline" size={24} color="#4CAF50" />
              <Title style={styles.cardTitle}>Visão Geral</Title>
            </View>
            
            <View style={styles.statsGrid}>
              <Surface style={styles.statItem}>
                <Text style={styles.statNumber}>{dashboardData.myClasses.length}</Text>
                <Text style={styles.statLabel}>Minhas Turmas</Text>
              </Surface>
              
              <Surface style={styles.statItem}>
                <Text style={styles.statNumber}>{dashboardData.totalStudents}</Text>
                <Text style={styles.statLabel}>Total Alunos</Text>
              </Surface>
              
              <Surface style={styles.statItem}>
                <Text style={styles.statNumber}>{dashboardData.todayClasses.length}</Text>
                <Text style={styles.statLabel}>Aulas Hoje</Text>
              </Surface>
              
              <Surface style={styles.statItem}>
                <Text style={styles.statNumber}>{dashboardData.activeCheckIns}</Text>
                <Text style={styles.statLabel}>Check-ins Ativos</Text>
              </Surface>
            </View>
          </Card.Content>
        </Card>

        {/* Aulas de Hoje */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="today-outline" size={24} color="#2196F3" />
              <Title style={styles.cardTitle}>Aulas de Hoje</Title>
            </View>
            
            {dashboardData.todayClasses.length > 0 ? (
              dashboardData.todayClasses.map((classItem, index) => (
                <View key={index} style={styles.classItem}>
                  <View style={styles.classHeader}>
                    <Text style={styles.className}>{classItem.name}</Text>
                    <Chip mode="outlined" style={styles.modalityChip}>
                      {classItem.modality}
                    </Chip>
                  </View>
                  
                  <View style={styles.classDetails}>
                    <Text style={styles.classTime}>
                      {classItem.schedule?.map(s => 
                        `${getDayName(s.dayOfWeek)} ${formatTime(s.hour, s.minute)}`
                      ).join(', ')}
                    </Text>
                    <Text style={styles.classCapacity}>
                      Capacidade: {classItem.currentStudents || 0}/{classItem.maxCapacity || 'N/A'}
                    </Text>
                  </View>
                  
                  <Button 
                    mode="outlined" 
                    onPress={() => navigation.navigate('Turmas', { classId: classItem.id })}
                    style={styles.classButton}
                    icon="eye"
                  >
                    Ver Detalhes
                  </Button>
                  
                  {index < dashboardData.todayClasses.length - 1 && (
                    <Divider style={styles.divider} />
                  )}
                </View>
              ))
            ) : (
              <Paragraph style={styles.emptyText}>
                Nenhuma aula agendada para hoje
              </Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Ações Rápidas */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Ações Rápidas</Title>
            
            <View style={styles.quickActions}>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Turmas')}
                style={[styles.quickActionButton, { backgroundColor: '#4CAF50' }]}
                icon="school"
              >
                Minhas Turmas
              </Button>
              
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Alunos')}
                style={[styles.quickActionButton, { backgroundColor: '#2196F3' }]}
                icon="account"
              >
                Meus Alunos
              </Button>
            </View>
            
            <View style={styles.quickActions}>
              <Button 
                mode="outlined" 
                onPress={() => {/* Implementar graduação rápida */}}
                style={styles.quickActionButton}
                icon="trophy"
              >
                Registrar Graduação
              </Button>
              
              <Button 
                mode="outlined" 
                onPress={() => {/* Implementar check-in */}}
                style={styles.quickActionButton}
                icon="check"
              >
                Ver Check-ins
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

        {/* Graduações Recentes */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="trophy-outline" size={24} color="#FFD700" />
              <Title style={styles.cardTitle}>Graduações Recentes</Title>
            </View>
            
            {dashboardData.recentGraduations.length > 0 ? (
              dashboardData.recentGraduations.map((graduation, index) => (
                <List.Item
                  key={index}
                  title={`${graduation.studentName} - ${graduation.graduation}`}
                  description={`${graduation.modality} • ${graduation.date.toLocaleDateString('pt-BR')}`}
                  left={() => <List.Icon icon="trophy" color="#FFD700" />}
                />
              ))
            ) : (
              <Paragraph style={styles.emptyText}>
                Nenhuma graduação recente
              </Paragraph>
            )}
            
            <Button 
              mode="text" 
              onPress={() => {/* Implementar histórico completo */}}
              style={styles.viewAllButton}
            >
              Ver Todas as Graduações
            </Button>
          </Card.Content>
        </Card>

        {/* Próximas Aulas */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar-outline" size={24} color="#FF9800" />
              <Title style={styles.cardTitle}>Próximas Aulas</Title>
            </View>
            
            {dashboardData.upcomingClasses.length > 0 ? (
              dashboardData.upcomingClasses.map((classItem, index) => (
                <View key={index} style={styles.upcomingClass}>
                  <Text style={styles.upcomingClassName}>{classItem.name}</Text>
                  <Text style={styles.upcomingClassInfo}>
                    {classItem.modality} • {classItem.schedule?.[0] ? 
                      `${getDayName(classItem.schedule[0].dayOfWeek)} ${formatTime(classItem.schedule[0].hour)}` 
                      : 'Horário não definido'}
                  </Text>
                  {index < dashboardData.upcomingClasses.length - 1 && (
                    <Divider style={styles.divider} />
                  )}
                </View>
              ))
            ) : (
              <Paragraph style={styles.emptyText}>
                Nenhuma aula próxima
              </Paragraph>
            )}
            
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('Turmas')}
              style={styles.viewAllButton}
            >
              Ver Todas as Turmas
            </Button>
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
    backgroundColor: '#4CAF50',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  classItem: {
    marginBottom: 16,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  modalityChip: {
    marginLeft: 8,
  },
  classDetails: {
    marginBottom: 8,
  },
  classTime: {
    color: '#666',
    marginBottom: 4,
  },
  classCapacity: {
    color: '#666',
    fontSize: 12,
  },
  classButton: {
    marginTop: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  upcomingClass: {
    marginBottom: 8,
  },
  upcomingClassName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  upcomingClassInfo: {
    color: '#666',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  divider: {
    marginVertical: 8,
  },
  viewAllButton: {
    marginTop: 8,
  },
});

export default InstructorDashboard;
