import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  Avatar,
  Badge,
  Divider,
  Icon
} from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService, classService, paymentService, announcementService } from '../../services/firestoreService';

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
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
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
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header com informações do usuário */}
        <Card containerStyle={styles.userCard}>
          <View style={styles.userHeader}>
            <Avatar 
              size={60} 
              title={userProfile?.name?.charAt(0) || 'U'}
              containerStyle={styles.avatar}
              titleStyle={styles.avatarText}
            />
            <View style={styles.userInfo}>
              <Text h3 style={styles.userName}>{userProfile?.name || 'Usuário'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Badge 
                value="Aluno"
                status="primary"
                containerStyle={styles.userTypeChip}
                textStyle={styles.chipText}
              />
            </View>
          </View>
        </Card>

        {/* Status de Pagamento */}
        <Card containerStyle={styles.paymentCard}>
          <View style={styles.cardHeader}>
            <Icon name="payment" type="material" size={24} color="#4CAF50" />
            <Text h4 style={styles.cardTitle}>Status de Pagamento</Text>
          </View>
          
          {dashboardData.paymentStatus ? (
            <View style={styles.paymentInfo}>
              <Badge 
                value={dashboardData.paymentStatus.status === 'paid' ? 'Em dia' : 'Pendente'}
                status={dashboardData.paymentStatus.status === 'paid' ? 'success' : 'warning'}
                containerStyle={styles.statusChip}
                textStyle={styles.statusChipText}
              />
              <Text style={styles.paymentDetails}>
                Vencimento: {dashboardData.paymentStatus.dueDate}
              </Text>
              {dashboardData.paymentStatus.status !== 'paid' && (
                <Button 
                  title="Ver Detalhes"
                  type="outline" 
                  onPress={() => navigation.navigate('StudentPayments')}
                  buttonStyle={styles.paymentButton}
                />
              )}
            </View>
          ) : (
            <Text>Carregando informações de pagamento...</Text>
          )}
        </Card>

        {/* Check-in Rápido */}
        {dashboardData.checkInAvailable && (
          <Card containerStyle={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="check-circle" type="material" size={24} color="#4CAF50" />
              <Text h4 style={styles.cardTitle}>Check-in Disponível</Text>
            </View>
            <Text style={styles.checkInText}>
              Você tem uma aula começando em breve!
            </Text>
            <Button 
              title="Fazer Check-in"
              onPress={handleCheckIn}
              buttonStyle={styles.checkInButton}
              icon={<Icon name="check" type="material" size={20} color="#fff" />}
            />
          </Card>
        )}

        {/* Próximas Aulas */}
        <Card containerStyle={styles.classesCard}>
          <View style={styles.cardHeader}>
            <Icon name="event" type="material" size={24} color="#2196F3" />
            <Text h4 style={styles.cardTitle}>Próximas Aulas</Text>
          </View>
          
          {dashboardData.nextClasses.length > 0 ? (
            dashboardData.nextClasses.map((classItem, index) => (
              <View key={index} style={styles.classItem}>
                <View style={styles.classInfo}>
                  <Text style={styles.className}>{classItem.name}</Text>
                  <Text style={styles.classTime}>
                    {classItem.schedule?.day} - {classItem.schedule?.time}
                  </Text>
                  <Text style={styles.classInstructor}>
                    Prof. {classItem.instructorName}
                  </Text>
                </View>
                <Button 
                  title="Ver Detalhes"
                  size="sm"
                  onPress={() => navigation.navigate('StudentCalendar')}
                  buttonStyle={styles.classButton}
                />
              </View>
            ))
          ) : (
            <Text>Nenhuma aula agendada</Text>
          )}
          
          <Divider style={styles.divider} />
          
          <Button 
            title="Ver Calendário Completo"
            type="outline"
            onPress={() => navigation.navigate('StudentCalendar')}
            buttonStyle={styles.viewAllButton}
            icon={<Icon name="event" type="material" size={20} color="#2196F3" />}
          />
        </Card>

        {/* Avisos Recentes */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="notifications" type="material" size={24} color="#FF9800" />
            <Text h4 style={styles.cardTitle}>Avisos Recentes</Text>
          </View>
          
          {dashboardData.recentAnnouncements.length > 0 ? (
            dashboardData.recentAnnouncements.map((announcement, index) => (
              <View key={index} style={styles.announcementItem}>
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <Text style={styles.announcementContent} numberOfLines={2}>
                  {announcement.content}
                </Text>
                {index < dashboardData.recentAnnouncements.length - 1 && (
                  <Divider style={styles.divider} />
                )}
              </View>
            ))
          ) : (
            <Text>Nenhum aviso recente</Text>
          )}
          
        </Card>

        {/* Avisos Recentes */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="notifications" type="material" size={24} color="#FF9800" />
            <Text h4 style={styles.cardTitle}>Avisos Recentes</Text>
          </View>
          
          {dashboardData.recentAnnouncements.length > 0 ? (
            dashboardData.recentAnnouncements.map((announcement, index) => (
              <View key={index} style={styles.announcementItem}>
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <Text style={styles.announcementContent} numberOfLines={2}>
                  {announcement.content}
                </Text>
                {index < dashboardData.recentAnnouncements.length - 1 && (
                  <Divider style={styles.divider} />
                )}
              </View>
            ))
          ) : (
            <Text>Nenhum aviso recente</Text>
          )}
          
          <Button 
            title="Ver Todos os Avisos"
            type="outline"
            onPress={() => navigation.navigate('StudentAnnouncements')}
            buttonStyle={styles.viewAllButton}
            icon={<Icon name="notifications" type="material" size={20} color="#FF9800" />}
          />
        </Card>

        {/* Acesso Rápido */}
        <Card containerStyle={styles.card}>
          <Text h4 style={styles.cardTitle}>Acesso Rápido</Text>
          <View style={styles.quickActions}>
            <Button 
              title="Minha Evolução"
              type="outline" 
              onPress={() => navigation.navigate('StudentEvolution')}
              buttonStyle={styles.quickActionButton}
              icon={<Icon name="trending-up" type="material" size={20} color="#2196F3" />}
            />
            <Button 
              title="Pagamentos"
              type="outline" 
              onPress={() => navigation.navigate('StudentPayments')}
              buttonStyle={styles.quickActionButton}
              icon={<Icon name="payment" type="material" size={20} color="#2196F3" />}
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
  paymentCard: {
    margin: 16,
    marginTop: 8,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  paymentInfo: {
    marginTop: 8,
  },
  statusChip: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  paymentButton: {
    alignSelf: 'flex-start',
  },
  classesCard: {
    margin: 16,
    marginTop: 8,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  classTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  classInstructor: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  classButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  divider: {
    marginVertical: 12,
  },
  viewAllButton: {
    marginTop: 12,
  },
  checkInText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  checkInButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
  },
  announcementItem: {
    paddingVertical: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  announcementContent: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickActionButton: {
    flex: 0.48,
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
  avatarText: {
    color: 'white',
    fontWeight: '600',
  },
});
