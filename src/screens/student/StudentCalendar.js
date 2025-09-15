import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Chip,
  Text,
  List,
  FAB,
  Searchbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthProvider';
import { useTheme } from '../../contexts/ThemeContext';
import { firestoreService, classService } from '../../services/firestoreService';

const StudentCalendar = ({ navigation }) => {
  const { user, userProfile } = useAuth();
  const { getString } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [dayClasses, setDayClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    filterClassesByDate(selectedDate);
  }, [selectedDate, classes]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      
      // Buscar turmas do aluno
      const userClasses = await Promise.all(
        (userProfile?.classIds || []).map(classId => 
          firestoreService.getById('classes', classId)
        )
      );
      
      const validClasses = userClasses.filter(Boolean);
      setClasses(validClasses);
      
      // Criar marcações no calendário
      const marks = {};
      validClasses.forEach(classItem => {
        if (classItem.schedule) {
          classItem.schedule.forEach(schedule => {
            // Calcular próximas datas para esta aula
            const dates = getNextDatesForClass(schedule.dayOfWeek, 30); // próximos 30 dias
            dates.forEach(date => {
              if (!marks[date]) {
                marks[date] = { marked: true, dotColor: '#2196F3' };
              }
            });
          });
        }
      });
      
      // Marcar data selecionada
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: '#2196F3'
      };
      
      setMarkedDates(marks);
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
      Alert.alert(getString('error'), getString('cannotLoadClasses'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getNextDatesForClass = (dayOfWeek, daysAhead) => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i <= daysAhead; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (date.getDay() === dayOfWeek) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    return dates;
  };

  const filterClassesByDate = (date) => {
    const selectedDay = new Date(date).getDay();
    
    const classesForDay = classes.filter(classItem => 
      classItem.schedule?.some(schedule => schedule.dayOfWeek === selectedDay)
    ).map(classItem => ({
      ...classItem,
      todaySchedule: classItem.schedule.filter(s => s.dayOfWeek === selectedDay)
    }));
    
    setDayClasses(classesForDay);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadClasses();
  };

  const onDayPress = (day) => {
    const newMarkedDates = { ...markedDates };
    
    // Remove seleção anterior
    Object.keys(newMarkedDates).forEach(date => {
      if (newMarkedDates[date].selected) {
        delete newMarkedDates[date].selected;
        delete newMarkedDates[date].selectedColor;
      }
    });
    
    // Adiciona nova seleção
    newMarkedDates[day.dateString] = {
      ...newMarkedDates[day.dateString],
      selected: true,
      selectedColor: '#2196F3'
    };
    
    setSelectedDate(day.dateString);
    setMarkedDates(newMarkedDates);
  };

  const formatTime = (hour, minute = 0) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCheckIn = (classItem) => {
    // Verificar se está no horário correto para check-in
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const canCheckIn = classItem.todaySchedule.some(schedule => {
      const classTime = schedule.hour * 60 + (schedule.minute || 0);
      const currentTime = currentHour * 60 + currentMinute;
      const timeDiff = Math.abs(classTime - currentTime);
      
      return timeDiff <= 15; // 15 minutos antes ou depois
    });
    
    if (canCheckIn) {
      Alert.alert('Check-in', 'Check-in realizado com sucesso!');
    } else {
      Alert.alert(getString('checkIn'), getString('checkInTimeError'));
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
        {/* Calendário */}
        <Card style={styles.calendarCard}>
          <Card.Content>
            <Calendar
              onDayPress={onDayPress}
              markedDates={markedDates}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: '#2196F3',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#2196F3',
                dayTextColor: '#2d4150',
                textDisabledColor: '#d9e1e8',
                dotColor: '#2196F3',
                selectedDotColor: '#ffffff',
                arrowColor: '#2196F3',
                monthTextColor: '#2196F3',
                indicatorColor: '#2196F3',
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 13
              }}
            />
          </Card.Content>
        </Card>

        {/* Aulas do Dia Selecionado */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar-outline" size={24} color="#2196F3" />
              <Title style={styles.cardTitle}>
                Aulas - {formatDate(selectedDate)}
              </Title>
            </View>
            
            {dayClasses.length > 0 ? (
              dayClasses.map((classItem, index) => (
                <View key={index} style={styles.classItem}>
                  <View style={styles.classHeader}>
                    <Text style={styles.className}>{classItem.name}</Text>
                    <Chip mode="outlined" style={styles.modalityChip}>
                      {classItem.modality}
                    </Chip>
                  </View>
                  
                  {classItem.todaySchedule.map((schedule, scheduleIndex) => (
                    <View key={scheduleIndex} style={styles.scheduleItem}>
                      <View style={styles.timeInfo}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.timeText}>
                          {formatTime(schedule.hour, schedule.minute)}
                        </Text>
                      </View>
                      
                      <View style={styles.instructorInfo}>
                        <Ionicons name="person-outline" size={16} color="#666" />
                        <Text style={styles.instructorText}>
                          {classItem.instructorName || 'Professor não definido'}
                        </Text>
                      </View>
                      
                      {classItem.location && (
                        <View style={styles.locationInfo}>
                          <Ionicons name="location-outline" size={16} color="#666" />
                          <Text style={styles.locationText}>{classItem.location}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                  
                  <View style={styles.classActions}>
                    <Button 
                      mode="outlined" 
                      onPress={() => navigation.navigate('ClassDetails', { classId: classItem.id })}
                      style={styles.actionButton}
                      icon="eye"
                    >
                      Detalhes
                    </Button>
                    
                    <Button 
                      mode="contained" 
                      onPress={() => handleCheckIn(classItem)}
                      style={styles.actionButton}
                      icon="check"
                    >
                      Check-in
                    </Button>
                  </View>
                  
                  {index < dayClasses.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-clear-outline" size={48} color="#ccc" />
                <Paragraph style={styles.emptyText}>
                  Nenhuma aula agendada para este dia
                </Paragraph>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Resumo Semanal */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="stats-chart-outline" size={24} color="#4CAF50" />
              <Title style={styles.cardTitle}>Resumo Semanal</Title>
            </View>
            
            <View style={styles.weeklyStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{classes.length}</Text>
                <Text style={styles.statLabel}>Turmas</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {classes.reduce((total, c) => total + (c.schedule?.length || 0), 0)}
                </Text>
                <Text style={styles.statLabel}>Aulas/Semana</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {[...new Set(classes.map(c => c.modality))].length}
                </Text>
                <Text style={styles.statLabel}>Modalidades</Text>
              </View>
            </View>
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
  calendarCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
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
  scheduleItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  instructorText: {
    marginLeft: 8,
    color: '#666',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    color: '#666',
  },
  classActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default StudentCalendar;
