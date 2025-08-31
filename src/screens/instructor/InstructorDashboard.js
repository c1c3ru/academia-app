import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform } from 'react-native';
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
        {/* Header com informações do instrutor */}
        <Card containerStyle={styles.userCard}>
          <View style={styles.userHeader}>
            <Avatar 
              size={60} 
              title={userProfile?.name?.charAt(0) || 'I'}
              containerStyle={styles.avatar}
              titleStyle={styles.avatarText}
            />
            <View style={styles.userInfo}>
              <Text h3 style={styles.userName}>{userProfile?.name || 'Instrutor'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Badge 
                value="Instrutor"
                status="warning"
                containerStyle={styles.userTypeChip}
                textStyle={styles.chipText}
              />
            </View>
          </View>
        </Card>

        {/* Estatísticas Rápidas */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="analytics" type="material" size={24} color="#4CAF50" />
            <Text h4 style={styles.cardTitle}>Visão Geral</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <Card containerStyle={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
              <Icon name="people" type="material" size={32} color="#2196F3" />
              <Text style={styles.statNumber}>{dashboardData.totalStudents}</Text>
              <Text style={styles.statLabel}>Total de Alunos</Text>
            </Card>
            
            <Card containerStyle={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
              <Icon name="check-circle" type="material" size={32} color="#4CAF50" />
              <Text style={styles.statNumber}>{dashboardData.activeCheckIns}</Text>
              <Text style={styles.statLabel}>Check-ins Hoje</Text>
            </Card>
            
            <Card containerStyle={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
              <Icon name="event" type="material" size={32} color="#FF9800" />
              <Text style={styles.statNumber}>{dashboardData.todayClasses.length}</Text>
              <Text style={styles.statLabel}>Aulas Hoje</Text>
            </Card>
            
            <Card containerStyle={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
              <Icon name="emoji-events" type="material" size={32} color="#9C27B0" />
              <Text style={styles.statNumber}>{dashboardData.recentGraduations.length}</Text>
              <Text style={styles.statLabel}>Graduações Recentes</Text>
            </Card>
          </View>
        </Card>

        {/* Aulas de Hoje */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="today" type="material" size={24} color="#2196F3" />
            <Text h4 style={styles.cardTitle}>Aulas de Hoje</Text>
          </View>
          
          {dashboardData.todayClasses.length > 0 ? (
            dashboardData.todayClasses.map((classItem, index) => (
              <View key={index} style={styles.classItem}>
                <View style={styles.classHeader}>
                  <Text style={styles.className}>{classItem.name}</Text>
                  <Badge 
                    value={classItem.modality}
                    status="primary"
                    containerStyle={styles.modalityChip}
                  />
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
                  type="outline" 
                  onPress={() => navigation.navigate('Turmas', { classId: classItem.id })}
                  buttonStyle={styles.classButton}
                  icon={<Icon name="visibility" type="material" size={16} color="#2196F3" />}
                  title="Ver Detalhes"
                />
                
                {index < dashboardData.todayClasses.length - 1 && (
                  <Divider style={styles.divider} />
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              Nenhuma aula agendada para hoje
            </Text>
          )}
        </Card>

        {/* Ações Rápidas */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="flash-on" type="material" size={24} color="#FF9800" />
            <Text h4 style={styles.cardTitle}>Ações Rápidas</Text>
          </View>
          
          <View style={styles.quickActionsGrid}>
            <Button
              title="Gerenciar Turmas"
              onPress={() => navigation.navigate('Turmas')}
              buttonStyle={[styles.quickActionButton, { backgroundColor: '#2196F3' }]}
              icon={<Icon name="school" type="material" size={20} color="white" />}
            />
            
            <Button
              title="Ver Alunos"
              onPress={() => navigation.navigate('Alunos')}
              buttonStyle={[styles.quickActionButton, { backgroundColor: '#4CAF50' }]}
              icon={<Icon name="group" type="material" size={20} color="white" />}
            />
            
            <Button
              title="Relatórios"
              onPress={() => navigation.navigate('Relatórios')}
              buttonStyle={[styles.quickActionButton, { backgroundColor: '#FF9800' }]}
              icon={<Icon name="bar-chart" type="material" size={20} color="white" />}
            />
            
            <Button
              title="Configurações"
              onPress={() => navigation.navigate('Configurações')}
              buttonStyle={[styles.quickActionButton, { backgroundColor: '#9C27B0' }]}
              icon={<Icon name="settings" type="material" size={20} color="white" />}
            />
          </View>
        </Card>

        {/* Graduações Recentes */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="emoji-events" type="material" size={24} color="#FFD700" />
            <Text h4 style={styles.cardTitle}>Graduações Recentes</Text>
          </View>
          
          {dashboardData.recentGraduations.length > 0 ? (
            dashboardData.recentGraduations.map((graduation, index) => (
              <ListItem key={index} bottomDivider>
                <Icon name="emoji-events" type="material" color="#FFD700" />
                <ListItem.Content>
                  <ListItem.Title>{`${graduation.studentName} - ${graduation.graduation}`}</ListItem.Title>
                  <ListItem.Subtitle>{`${graduation.modality} • ${graduation.date.toLocaleDateString('pt-BR')}`}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
            ))
          ) : (
            <Text style={styles.emptyText}>
              Nenhuma graduação recente
            </Text>
          )}
          
          <Button 
            type="clear" 
            onPress={() => {/* Implementar histórico completo */}}
            buttonStyle={styles.viewAllButton}
            title="Ver Todas as Graduações"
          />
        </Card>

        {/* Próximas Aulas */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="event" type="material" size={24} color="#FF9800" />
            <Text h4 style={styles.cardTitle}>Próximas Aulas</Text>
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
            <Text style={styles.emptyText}>
              Nenhuma aula próxima
            </Text>
          )}
          
          <Button 
            type="outline" 
            onPress={() => navigation.navigate('Turmas')}
            buttonStyle={styles.viewAllButton}
            title="Ver Todas as Turmas"
          />
        </Card>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <Button
            type="outline"
            title="Sair"
            onPress={logout}
            buttonStyle={styles.logoutButton}
            titleStyle={styles.logoutButtonText}
            icon={<Icon name="logout" type="material" size={20} color="#F44336" />}
          />
        </View>
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
  userCard: {
    margin: 16,
    marginBottom: 8,
    ...Platform.select({

      ios: {},

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',

      },

    }),
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#4CAF50',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    marginBottom: 4,
    color: '#333',
  },
  userEmail: {
    color: '#666',
    marginBottom: 8,
  },
  userTypeChip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 12,
  },
  card: {
    margin: 16,
    marginTop: 8,
    ...Platform.select({

      ios: {},

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',

      },

    }),
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
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    ...Platform.select({

      ios: {},

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',

      },

    }),
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
  upcomingClass: {
    marginBottom: 12,
  },
  upcomingClassName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  upcomingClassInfo: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 16,
  },
  viewAllButton: {
    marginTop: 16,
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
  divider: {
    marginVertical: 8,
  },
  viewAllButton: {
    marginTop: 8,
  },
});

export default InstructorDashboard;
