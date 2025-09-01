import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity, Platform } from 'react-native';
import { 
  Card, 
  Text, 
  Button,
  Badge,
  Icon
} from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { Calendar } from 'react-native-calendars'; // Removido - dependência não disponível
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService, classService } from '../../services/firestoreService';

const StudentCalendar = ({ navigation }) => {
  const { user, userProfile } = useAuth();
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
      Alert.alert('Erro', 'Não foi possível carregar as aulas');
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
    );
    
    setDayClasses(classesForDay);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadClasses();
  };

  const formatTime = (time) => {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const getDayName = (dayIndex) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayIndex] || '';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
      >
        <Card containerStyle={styles.calendarCard}>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: '#2196F3',
              todayTextColor: '#2196F3',
              dotColor: '#2196F3',
              arrowColor: '#2196F3',
            }}
          />
        </Card>

        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={24} color="#2196F3" />
            <Text style={styles.cardTitle}>
              {new Date(selectedDate).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </Text>
          </View>

          {loading ? (
            <Text>Carregando...</Text>
          ) : dayClasses.length > 0 ? (
            <>
              {dayClasses.map((classItem, index) => (
                <View key={index} style={styles.classItem}>
                  <View style={styles.classHeader}>
                    <Text style={styles.className}>{classItem.name}</Text>
                    <Badge
                      value={classItem.modality}
                      status="primary"
                      textStyle={styles.modalityText}
                      containerStyle={styles.modalityChip}
                    />
                  </View>
                  
                  {classItem.schedule
                    ?.filter(schedule => schedule.dayOfWeek === new Date(selectedDate).getDay())
                    .map((schedule, schedIndex) => (
                      <View key={schedIndex} style={styles.scheduleItem}>
                        <View style={styles.timeInfo}>
                          <Ionicons name="time-outline" size={16} color="#666" />
                          <Text style={styles.timeText}>
                            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                          </Text>
                        </View>
                        
                        <View style={styles.classInfo}>
                          <Ionicons name="person-outline" size={16} color="#666" />
                          <Text style={styles.classInfoText}>
                            {classItem.instructorName || 'Sem instrutor'}
                          </Text>
                        </View>
                        
                        {classItem.location && (
                          <View style={styles.classInfo}>
                            <Ionicons name="location-outline" size={16} color="#666" />
                            <Text style={styles.locationText}>
                              {classItem.location}
                            </Text>
                          </View>
                        )}
                        
                        <View style={styles.classActions}>
                          <Button
                            title="Ver detalhes"
                            type="outline"
                            buttonStyle={styles.actionButton}
                            onPress={() => navigation.navigate('ClassDetails', { classId: classItem.id })}
                          />
                          <Button
                            title="Marcar presença"
                            buttonStyle={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                            onPress={() => navigation.navigate('CheckIn', { classId: classItem.id })}
                          />
                        </View>
                      </View>
                    ))}
                </View>
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                Nenhuma aula agendada para este dia.
              </Text>
            </View>
          )}
        </Card>

        <Card containerStyle={styles.card}>
          <Text style={{ fontWeight: 'bold', marginBottom: 16 }}>Resumo Semanal</Text>
          
          <View style={styles.weeklyStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {Array.from(new Set(classes.flatMap(c => c.schedule?.map(s => s.dayOfWeek) || []))).length}
              </Text>
              <Text style={styles.statLabel}>Dias de Aula</Text>
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
  scrollContent: {
    paddingBottom: 100,
  },
  calendarCard: {
    margin: 16,
    marginBottom: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      },
      ios: {},
      default: {
        elevation: 4
      }
    }),
  },
  card: {
    margin: 16,
    marginTop: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      },
      ios: {},
      default: {
        elevation: 4
      }
    })
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
    backgroundColor: '#2196F3',
    marginLeft: 8,
  },
  modalityText: {
    color: 'white',
    fontSize: 12,
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
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  classInfoText: {
    marginLeft: 4,
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
