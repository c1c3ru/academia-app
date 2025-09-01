import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform, TouchableOpacity, Dimensions, Alert } from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient'; // Removido - dependência não disponível
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService, classService, studentService } from '../../services/firestoreService';

const { width } = Dimensions.get('window');

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
    Alert.alert(
      'Confirmar Logout',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert('Sucesso', 'Logout realizado com sucesso!');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com gradiente */}
      <LinearGradient
        colors={['#4CAF50', '#66BB6A']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.userSection}>
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.avatarContainer}
            >
              <Text style={styles.avatarText}>
                {userProfile?.name?.charAt(0) || 'I'}
              </Text>
            </LinearGradient>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userProfile?.name || 'Instrutor'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.userBadge}>
                <Ionicons name="school" size={14} color="#fff" />
                <Text style={styles.badgeText}>Instrutor</Text>
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* Cards de Estatísticas */}
        <View style={styles.statsCardsContainer}>
          <LinearGradient
            colors={['#2196F3', '#42A5F5']}
            style={styles.statCardModern}
          >
            <View style={styles.statCardHeader}>
              <Ionicons name="people" size={24} color="#fff" />
              <Text style={styles.statCardTitle}>Alunos</Text>
            </View>
            <Text style={styles.statValue}>{dashboardData.totalStudents}</Text>
            <TouchableOpacity 
              style={styles.statCardButton}
              onPress={() => navigation.navigate('Alunos')}
            >
              <Text style={styles.statCardButtonText}>Ver Todos</Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['#FF9800', '#FFB74D']}
            style={styles.statCardModern}
          >
            <View style={styles.statCardHeader}>
              <Ionicons name="today" size={24} color="#fff" />
              <Text style={styles.statCardTitle}>Hoje</Text>
            </View>
            <Text style={styles.statValue}>{dashboardData.todayClasses.length}</Text>
            <TouchableOpacity 
              style={styles.statCardButton}
              onPress={() => navigation.navigate('Turmas')}
            >
              <Text style={styles.statCardButtonText}>Ver Aulas</Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Aulas de Hoje */}
        <Card containerStyle={styles.modernCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="today" size={26} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Aulas de Hoje</Text>
          </View>
          
          {dashboardData.todayClasses.length > 0 ? (
            <View style={styles.classesList}>
              {dashboardData.todayClasses.map((classItem, index) => (
                <LinearGradient
                  key={classItem.id || `class-${index}`}
                  colors={['#f8f9fa', '#ffffff']}
                  style={styles.classCard}
                >
                  <View style={styles.classCardContent}>
                    <View style={styles.classIconContainer}>
                      <Ionicons name="fitness" size={20} color="#4CAF50" />
                    </View>
                    <View style={styles.classDetails}>
                      <Text style={styles.classTitle}>{classItem.name}</Text>
                      <Text style={styles.classSchedule}>
                        {classItem.schedule?.map((s) => 
                          `${getDayName(s.dayOfWeek)} ${formatTime(s.hour, s.minute)}`
                        ).join(', ')}
                      </Text>
                      <Text style={styles.classCapacityText}>
                        👥 {classItem.currentStudents || 0}/{classItem.maxCapacity || 'N/A'} alunos
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.classActionButton}
                      onPress={() => navigation.navigate('Turmas', { classId: classItem.id })}
                    >
                      <Ionicons name="chevron-forward" size={18} color="#4CAF50" />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#adb5bd" />
              <Text style={styles.emptyText}>Nenhuma aula agendada para hoje</Text>
              <Text style={styles.emptySubtext}>Suas aulas aparecerão aqui</Text>
            </View>
          )}
        </Card>

        {/* Ações Rápidas */}
        <Card containerStyle={styles.modernCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={26} color="#FF9800" />
            <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          </View>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCardModern}
              onPress={() => navigation.navigate('Turmas')}
            >
              <LinearGradient
                colors={['#2196F3', '#42A5F5']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="school" size={28} color="#fff" />
                <Text style={styles.quickActionText}>Turmas</Text>
                <Text style={styles.quickActionCount}>{dashboardData.myClasses.length}</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCardModern}
              onPress={() => navigation.navigate('Alunos')}
            >
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="people" size={28} color="#fff" />
                <Text style={styles.quickActionText}>Alunos</Text>
                <Text style={styles.quickActionCount}>{dashboardData.totalStudents}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCardModern}
              onPress={() => navigation.navigate('AddGraduation')}
            >
              <LinearGradient
                colors={['#FF9800', '#FFB74D']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="trophy" size={28} color="#fff" />
                <Text style={styles.quickActionText}>Graduações</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCardModern}
              onPress={() => navigation.navigate('CheckIns')}
            >
              <LinearGradient
                colors={['#9C27B0', '#BA68C8']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="checkmark-done" size={28} color="#fff" />
                <Text style={styles.quickActionText}>Check-ins</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Graduações Recentes */}
        <Card containerStyle={styles.modernCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy" size={26} color="#FFD700" />
            <Text style={styles.sectionTitle}>Graduações Recentes</Text>
          </View>
          
          {dashboardData.recentGraduations.length > 0 ? (
            <View style={styles.graduationsList}>
              {dashboardData.recentGraduations.map((graduation, index) => (
                <LinearGradient
                  key={graduation.id || `graduation-${index}`}
                  colors={['#fff9c4', '#ffffff']}
                  style={styles.graduationCard}
                >
                  <View style={styles.graduationHeader}>
                    <View style={styles.graduationIconContainer}>
                      <Ionicons name="medal" size={18} color="#FFD700" />
                    </View>
                    <View style={styles.graduationDetails}>
                      <Text style={styles.graduationStudentName}>{graduation.studentName}</Text>
                      <Text style={styles.graduationInfo}>
                        {graduation.graduation} • {graduation.modality}
                      </Text>
                      <Text style={styles.graduationDate}>
                        📅 {graduation.date.toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={48} color="#adb5bd" />
              <Text style={styles.emptyText}>Nenhuma graduação recente</Text>
              <Text style={styles.emptySubtext}>Graduações aparecerão aqui</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.viewAllButtonModern}
            onPress={() => navigation.navigate('Graduações')}
          >
            <Ionicons name="trophy" size={20} color="#FFD700" />
            <Text style={[styles.viewAllButtonText, { color: '#FFD700' }]}>Ver Todas as Graduações</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFD700" />
          </TouchableOpacity>
        </Card>

        {/* Logout */}
        <Card containerStyle={styles.modernCard}>
          <TouchableOpacity 
            style={styles.logoutButtonModern}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color="#F44336" />
            <Text style={styles.logoutButtonTextModern}>Sair da Conta</Text>
          </TouchableOpacity>
        </Card>
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
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 32,
    gap: 12,
  },
  statCardModern: {
    flex: 1,
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
  classesList: {
    gap: 12,
  },
  classCard: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
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
  classCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  classDetails: {
    flex: 1,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  classSchedule: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 2,
  },
  classCapacityText: {
    fontSize: 13,
    color: '#666',
  },
  classActionButton: {
    padding: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 20,
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
  quickActionsGrid: {
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
  graduationsList: {
    gap: 12,
  },
  graduationCard: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
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
  graduationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  graduationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  graduationDetails: {
    flex: 1,
  },
  graduationStudentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  graduationInfo: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 2,
  },
  graduationDate: {
    fontSize: 12,
    color: '#666',
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
  },
  logoutButtonTextModern: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 8,
  },
});

export default InstructorDashboard;
