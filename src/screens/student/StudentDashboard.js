import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform, TouchableOpacity, Alert, Dimensions } from 'react-native';
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

const { width } = Dimensions.get('window');

const StudentDashboard = ({ navigation }) => {
  const { user, userProfile, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    nextClasses: [],
    paymentStatus: null,
    recentAnnouncements: [],
    checkInAvailable: false
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar próximas aulas
      const userClasses = await Promise.all(
        (userProfile?.classIds || []).map(classId => 
          firestoreService.getById('classes', classId)
        )
      );
      
      // Buscar status de pagamento
      const payments = await paymentService.getPaymentsByStudent(user.uid);
      const latestPayment = payments[0];
      
      // Buscar avisos recentes
      const announcements = await announcementService.getActiveAnnouncements();
      
      // Verificar se há check-in disponível
      const now = new Date();
      const checkInAvailable = userClasses.some(classItem => {
        if (!classItem?.schedule) return false;
        
        // Lógica simplificada - verificar se há aula nas próximas 2 horas
        const today = now.getDay();
        const currentHour = now.getHours();
        
        return classItem.schedule.some(schedule => 
          schedule.dayOfWeek === today && 
          Math.abs(schedule.hour - currentHour) <= 2
        );
      });

      setDashboardData({
        nextClasses: userClasses.filter(Boolean).slice(0, 3),
        paymentStatus: latestPayment,
        recentAnnouncements: announcements.slice(0, 3),
        checkInAvailable
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleCheckIn = () => {
    // Implementar lógica de check-in
    console.log('Check-in realizado');
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

  const getPaymentStatusColor = (status) => {
    switch (status?.status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'overdue': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status?.status) {
      case 'paid': return 'Em dia';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Atrasado';
      default: return 'Não informado';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com gradiente */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.userSection}>
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.avatarContainer}
            >
              <Text style={styles.avatarText}>
                {userProfile?.name?.charAt(0) || 'U'}
              </Text>
            </LinearGradient>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userProfile?.name || 'Usuário'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.userBadge}>
                <Ionicons name="school" size={14} color="#fff" />
                <Text style={styles.badgeText}>Aluno</Text>
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

        {/* Cards de Status */}
        <View style={styles.statusCardsContainer}>
          {/* Status de Pagamento */}
          <LinearGradient
            colors={['#4CAF50', '#66BB6A']}
            style={styles.statusCard}
          >
            <View style={styles.statusCardHeader}>
              <Ionicons name="card" size={24} color="#fff" />
              <Text style={styles.statusCardTitle}>Pagamento</Text>
            </View>
            <Text style={styles.statusValue}>
              {getPaymentStatusText(dashboardData.paymentStatus)}
            </Text>
            <TouchableOpacity 
              style={styles.statusCardButton}
              onPress={() => navigation.navigate('Pagamentos')}
            >
              <Text style={styles.statusCardButtonText}>Ver Detalhes</Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Check-in Status */}
          <LinearGradient
            colors={dashboardData.checkInAvailable ? ['#FF6B6B', '#EE5A24'] : ['#95A5A6', '#7F8C8D']}
            style={styles.statusCard}
          >
            <View style={styles.statusCardHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.statusCardTitle}>Check-in</Text>
            </View>
            <Text style={styles.statusValue}>
              {dashboardData.checkInAvailable ? 'Disponível' : 'Indisponível'}
            </Text>
            {dashboardData.checkInAvailable && (
              <TouchableOpacity 
                style={styles.statusCardButton}
                onPress={handleCheckIn}
              >
                <Text style={styles.statusCardButtonText}>Fazer Check-in</Text>
                <Ionicons name="chevron-forward" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>


        {/* Próximas Aulas */}
        <Card containerStyle={styles.modernCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={26} color="#667eea" />
            <Text style={styles.sectionTitle}>Próximas Aulas</Text>
          </View>
          
          {dashboardData.nextClasses.length > 0 ? (
            <View style={styles.classesList}>
              {dashboardData.nextClasses.map((classItem, index) => (
                <LinearGradient
                  key={index}
                  colors={['#f8f9fa', '#ffffff']}
                  style={styles.classCard}
                >
                  <View style={styles.classCardContent}>
                    <View style={styles.classIconContainer}>
                      <Ionicons name="fitness" size={20} color="#667eea" />
                    </View>
                    <View style={styles.classDetails}>
                      <Text style={styles.classTitle}>{classItem.name}</Text>
                      <Text style={styles.classSchedule}>
                        {classItem.schedule?.day} - {classItem.schedule?.time}
                      </Text>
                      <Text style={styles.classInstructorName}>
                        👨‍🏫 Prof. {classItem.instructorName}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.classActionButton}
                      onPress={() => navigation.navigate('Calendário')}
                    >
                      <Ionicons name="chevron-forward" size={18} color="#667eea" />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#adb5bd" />
              <Text style={styles.emptyText}>Nenhuma aula agendada</Text>
              <Text style={styles.emptySubtext}>Suas próximas aulas aparecerão aqui</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.viewAllButtonModern}
            onPress={() => navigation.navigate('Calendário')}
          >
            <Ionicons name="calendar" size={20} color="#667eea" />
            <Text style={styles.viewAllButtonText}>Ver Calendário Completo</Text>
            <Ionicons name="arrow-forward" size={16} color="#667eea" />
          </TouchableOpacity>
        </Card>

        {/* Avisos Recentes */}
        <Card containerStyle={styles.modernCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={26} color="#FF9800" />
            <Text style={styles.sectionTitle}>Avisos Recentes</Text>
          </View>
          
          {dashboardData.recentAnnouncements.length > 0 ? (
            <View style={styles.announcementsList}>
              {dashboardData.recentAnnouncements.map((announcement, index) => (
                <LinearGradient
                  key={index}
                  colors={['#fff5e6', '#ffffff']}
                  style={styles.announcementCard}
                >
                  <View style={styles.announcementHeader}>
                    <View style={styles.announcementIconContainer}>
                      <Ionicons name="megaphone" size={18} color="#FF9800" />
                    </View>
                    <Text style={styles.announcementTitle}>{announcement.title}</Text>
                  </View>
                  <Text style={styles.announcementContent} numberOfLines={2}>
                    {announcement.content}
                  </Text>
                </LinearGradient>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={48} color="#adb5bd" />
              <Text style={styles.emptyText}>Nenhum aviso recente</Text>
              <Text style={styles.emptySubtext}>Novos avisos aparecerão aqui</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.viewAllButtonModern}
            onPress={() => navigation.navigate('StudentAnnouncements')}
          >
            <Ionicons name="notifications" size={20} color="#FF9800" />
            <Text style={[styles.viewAllButtonText, { color: '#FF9800' }]}>Ver Todos os Avisos</Text>
            <Ionicons name="arrow-forward" size={16} color="#FF9800" />
          </TouchableOpacity>
        </Card>

        {/* Acesso Rápido */}
        <Card containerStyle={styles.modernCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={26} color="#9C27B0" />
            <Text style={styles.sectionTitle}>Acesso Rápido</Text>
          </View>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Evolução')}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="trending-up" size={28} color="#fff" />
                <Text style={styles.quickActionText}>Minha Evolução</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Pagamentos')}
            >
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="card" size={28} color="#fff" />
                <Text style={styles.quickActionText}>Pagamentos</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
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
  statusCardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 32,
    gap: 12,
  },
  statusCard: {
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
  statusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  statusCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusCardButtonText: {
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
    borderLeftColor: '#667eea',
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
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
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
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 2,
  },
  classInstructorName: {
    fontSize: 13,
    color: '#666',
  },
  classActionButton: {
    padding: 8,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
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
    color: '#667eea',
    marginHorizontal: 8,
  },
  announcementsList: {
    gap: 12,
  },
  announcementCard: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
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
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  announcementContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickActionCard: {
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

export default StudentDashboard;
