import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  FAB,
  Surface,
  Avatar,
  Chip,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthProvider';
import { firestoreService } from '../../services/firestoreService';
import { getThemeColors } from '../../theme/professionalTheme';

const { width } = Dimensions.get('window');

const CheckInScreen = ({ navigation }) => {
  const { user, userProfile, academia } = useAuth();
  const [loading, setLoading] = useState(false);
  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  
  const themeColors = getThemeColors(userProfile?.userType);

  useEffect(() => {
    loadCheckInData();
    loadAvailableClasses();
  }, []);

  const loadCheckInData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Buscar check-in de hoje
      const todayCheckIns = await firestoreService.getDocuments(
        `gyms/${academia.id}/checkins`,
        [
          { field: 'userId', operator: '==', value: user.uid },
          { field: 'date', operator: '>=', value: today },
          { field: 'date', operator: '<', value: tomorrow }
        ]
      );

      if (todayCheckIns.length > 0) {
        setTodayCheckIn(todayCheckIns[0]);
      }

      // Buscar check-ins recentes (últimos 7 dias)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const recentCheckIns = await firestoreService.getDocuments(
        `gyms/${academia.id}/checkins`,
        [
          { field: 'userId', operator: '==', value: user.uid },
          { field: 'date', operator: '>=', value: weekAgo }
        ],
        { field: 'date', direction: 'desc' }
      );

      setRecentCheckIns(recentCheckIns);
    } catch (error) {
      console.error('Erro ao carregar dados de check-in:', error);
    }
  };

  const loadAvailableClasses = async () => {
    try {
      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error('Academia ID não encontrado');
        return;
      }
      
      // Buscar turmas do aluno na academia
      const allClasses = await firestoreService.getAll(`gyms/${academiaId}/classes`);
      const userClasses = allClasses.filter(cls => 
        userProfile?.classIds && userProfile.classIds.includes(cls.id)
      );
      setAvailableClasses(userClasses);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const handleCheckIn = async (classId = null, className = null) => {
    try {
      setLoading(true);

      const checkInData = {
        userId: user.uid,
        userName: userProfile?.name || user.email,
        academiaId: academia.id,
        date: new Date(),
        classId: classId,
        className: className,
        type: classId ? 'class' : 'general',
        createdAt: new Date()
      };

      await firestoreService.create(`gyms/${academia.id}/checkins`, checkInData);

      Alert.alert(
        '✅ Check-in realizado!',
        classId ? `Check-in na aula de ${className} realizado com sucesso!` : 'Check-in geral realizado com sucesso!',
        [{ text: 'OK', onPress: () => loadCheckInData() }]
      );

    } catch (error) {
      console.error('Erro ao fazer check-in:', error);
      Alert.alert('Erro', 'Não foi possível realizar o check-in. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('pt-BR');
  };

  const getCheckInIcon = (type) => {
    return type === 'class' ? 'school' : 'checkmark-circle';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        {/* Status de Hoje */}
        <Card style={[styles.card, styles.todayCard]}>
          <Card.Content>
            <View style={styles.todayHeader}>
              <Avatar.Icon 
                size={60} 
                icon={todayCheckIn ? "check-circle" : "clock-outline"}
                style={[
                  styles.todayAvatar, 
                  { backgroundColor: todayCheckIn ? themeColors.success : themeColors.warning }
                ]}
              />
              <View style={styles.todayInfo}>
                <Text style={styles.todayTitle}>
                  {todayCheckIn ? '✅ Check-in Realizado' : '⏰ Aguardando Check-in'}
                </Text>
                <Text style={styles.todaySubtitle}>
                  {todayCheckIn 
                    ? `Hoje às ${formatTime(todayCheckIn.date)}`
                    : 'Faça seu check-in de hoje'
                  }
                </Text>
                {todayCheckIn?.className && (
                  <Chip 
                    mode="outlined" 
                    style={styles.classChip}
                    textStyle={{ fontSize: 12 }}
                  >
                    {todayCheckIn.className}
                  </Chip>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Turmas Disponíveis */}
        {availableClasses.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Ionicons name="school" size={24} color={themeColors.primary} />
                <Text style={styles.sectionTitle}>Suas Turmas</Text>
              </View>
              
              {availableClasses.map((classItem) => (
                <Surface key={classItem.id} style={styles.classItem} elevation={1}>
                  <View style={styles.classInfo}>
                    <View style={styles.classDetails}>
                      <Text style={styles.className}>{classItem.name}</Text>
                      <Text style={styles.classModality}>{classItem.modality}</Text>
                    </View>
                    <Button
                      mode="contained"
                      onPress={() => handleCheckIn(classItem.id, classItem.name)}
                      disabled={loading || todayCheckIn}
                      style={[styles.checkInButton, { backgroundColor: themeColors.primary }]}
                      compact
                    >
                      Check-in
                    </Button>
                  </View>
                </Surface>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Histórico Recente */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={24} color={themeColors.secondary} />
              <Text style={styles.sectionTitle}>Últimos Check-ins</Text>
            </View>
            
            {recentCheckIns.length > 0 ? (
              recentCheckIns.slice(0, 5).map((checkIn, index) => (
                <View key={checkIn.id || index} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <Ionicons 
                      name={getCheckInIcon(checkIn.type)} 
                      size={20} 
                      color={themeColors.primary} 
                    />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyTitle}>
                      {checkIn.className || 'Check-in Geral'}
                    </Text>
                    <Text style={styles.historyDate}>
                      {formatDate(checkIn.date)} às {formatTime(checkIn.date)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nenhum check-in registrado</Text>
                <Text style={styles.emptySubtext}>Faça seu primeiro check-in!</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* FAB para Check-in Geral */}
      {!todayCheckIn && (
        <FAB
          style={[styles.fab, { backgroundColor: themeColors.primary }]}
          icon={loading ? () => <ActivityIndicator color="white" /> : "plus"}
          label="Check-in Geral"
          onPress={() => handleCheckIn()}
          disabled={loading}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  todayCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayAvatar: {
    marginRight: 16,
  },
  todayInfo: {
    flex: 1,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  todaySubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  classChip: {
    alignSelf: 'flex-start',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  classItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  classInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classDetails: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  classModality: {
    fontSize: 14,
    color: '#666',
  },
  checkInButton: {
    borderRadius: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default CheckInScreen;
