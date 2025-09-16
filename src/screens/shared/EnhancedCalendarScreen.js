import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  FAB,
  Chip,
  Surface,
  Modal,
  Portal,
  Avatar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthProvider';
import { firestoreService } from '../../services/firestoreService';
import { getThemeColors } from '../../theme/professionalTheme';
import notificationService from '../../services/notificationService';

// Configurar localização para português
LocaleConfig.locales['pt'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ],
  dayNames: [
    'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
  ],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt';

const { width } = Dimensions.get('window');

const EnhancedCalendarScreen = ({ navigation }) => {
  const { user, userProfile, academia } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [dayClasses, setDayClasses] = useState([]);
  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [reminderSettings, setReminderSettings] = useState([30, 15, 10]);
  
  const themeColors = getThemeColors(userProfile?.userType);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadDayClasses(selectedDate);
  }, [selectedDate, classes]);

  const loadClasses = async () => {
    try {
      let userClasses = [];
      
      if (userProfile?.userType === 'admin') {
        // Admin vê todas as turmas
        userClasses = await firestoreService.getAll('classes');
      } else if (userProfile?.userType === 'instructor') {
        // Instrutor vê suas turmas
        const allClasses = await firestoreService.getAll('classes');
        userClasses = allClasses.filter(cls => cls.instructorId === user.uid);
      } else {
        // Aluno vê suas turmas matriculadas
        const allClasses = await firestoreService.getAll('classes');
        userClasses = allClasses.filter(cls => 
          userProfile?.classIds && userProfile.classIds.includes(cls.id)
        );
      }
      
      setClasses(userClasses);
      generateMarkedDates(userClasses);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const generateMarkedDates = (classList) => {
    const marked = {};
    const today = new Date().toISOString().split('T')[0];
    
    // Marcar hoje
    marked[today] = {
      selected: selectedDate === today,
      selectedColor: themeColors.primary,
      marked: true,
      dotColor: themeColors.accent
    };

    // Gerar datas das aulas para os próximos 3 meses
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);
    
    classList.forEach(classItem => {
      if (classItem.schedule && Array.isArray(classItem.schedule)) {
        classItem.schedule.forEach(schedule => {
          const dates = generateClassDates(schedule, endDate);
          dates.forEach(date => {
            const dateStr = date.toISOString().split('T')[0];
            if (!marked[dateStr]) {
              marked[dateStr] = { dots: [] };
            }
            
            if (!marked[dateStr].dots) {
              marked[dateStr].dots = [];
            }
            
            marked[dateStr].dots.push({
              color: getModalityColor(classItem.modality),
              selectedDotColor: 'white'
            });
            
            marked[dateStr].marked = true;
            marked[dateStr].dotColor = getModalityColor(classItem.modality);
          });
        });
      }
    });

    // Marcar data selecionada
    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = themeColors.primary;
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: themeColors.primary
      };
    }

    setMarkedDates(marked);
  };

  const generateClassDates = (schedule, endDate) => {
    const dates = [];
    const startDate = new Date();
    
    // Mapear dias da semana
    const dayMap = {
      'domingo': 0, 'segunda': 1, 'terça': 2, 'quarta': 3,
      'quinta': 4, 'sexta': 5, 'sábado': 6
    };
    
    const targetDay = dayMap[schedule.day?.toLowerCase()];
    if (targetDay === undefined) return dates;
    
    let currentDate = new Date(startDate);
    
    // Encontrar a próxima ocorrência do dia da semana
    while (currentDate.getDay() !== targetDay) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Gerar datas até o fim do período
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7); // Próxima semana
    }
    
    return dates;
  };

  const loadDayClasses = (date) => {
    const selectedDayOfWeek = new Date(date).toLocaleDateString('pt-BR', { weekday: 'long' });
    const dayMap = {
      'domingo': 'domingo', 'segunda-feira': 'segunda', 'terça-feira': 'terça',
      'quarta-feira': 'quarta', 'quinta-feira': 'quinta', 'sexta-feira': 'sexta',
      'sábado': 'sábado'
    };
    
    const mappedDay = dayMap[selectedDayOfWeek];
    
    const dayClassList = classes.filter(classItem => 
      classItem.schedule && classItem.schedule.some(s => 
        s.day?.toLowerCase() === mappedDay
      )
    ).map(classItem => ({
      ...classItem,
      scheduleForDay: classItem.schedule.filter(s => s.day?.toLowerCase() === mappedDay)
    }));
    
    // Ordenar por horário
    dayClassList.sort((a, b) => {
      const timeA = a.scheduleForDay[0]?.time || '00:00';
      const timeB = b.scheduleForDay[0]?.time || '00:00';
      return timeA.localeCompare(timeB);
    });
    
    setDayClasses(dayClassList);
  };

  const getModalityColor = (modality) => {
    const colors = {
      'Jiu-Jitsu': '#2196F3',
      'Muay Thai': '#F44336',
      'MMA': '#FF9800',
      'Boxe': '#4CAF50',
      'Karatê': '#9C27B0',
      'Taekwondo': '#FF5722'
    };
    return colors[modality] || themeColors.primary;
  };

  const handleClassPress = (classItem) => {
    setSelectedClass(classItem);
    setShowClassModal(true);
  };

  const handleScheduleReminder = async (classItem, schedule) => {
    try {
      const [hours, minutes] = schedule.time.split(':');
      const classDateTime = new Date(selectedDate);
      classDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      await notificationService.scheduleClassReminders(
        user.uid,
        classItem.name,
        classDateTime,
        reminderSettings
      );
      
      alert('Lembretes agendados com sucesso!');
      setShowClassModal(false);
    } catch (error) {
      console.error('Erro ao agendar lembretes:', error);
      alert('Erro ao agendar lembretes');
    }
  };

  const renderClassItem = (classItem) => (
    <TouchableOpacity
      key={classItem.id}
      onPress={() => handleClassPress(classItem)}
      style={styles.classItem}
    >
      <Surface style={styles.classCard} elevation={2}>
        <View style={styles.classHeader}>
          <View style={[styles.modalityIndicator, { backgroundColor: getModalityColor(classItem.modality) }]} />
          <View style={styles.classInfo}>
            <Text style={styles.className}>{classItem.name}</Text>
            <Text style={styles.classModality}>{classItem.modality}</Text>
          </View>
          <View style={styles.classTime}>
            {classItem.scheduleForDay?.map((schedule, index) => (
              <Chip key={index} mode="outlined" style={styles.timeChip}>
                {schedule.time}
              </Chip>
            ))}
          </View>
        </View>
        
        {classItem.instructor && (
          <View style={styles.instructorInfo}>
            <Avatar.Icon size={24} icon="account" style={styles.instructorAvatar} />
            <Text style={styles.instructorName}>{classItem.instructor}</Text>
          </View>
        )}
        
        <View style={styles.classActions}>
          <Button
            mode="outlined"
            compact
            onPress={() => navigation.navigate('ClassDetails', { 
              classId: classItem.id, 
              classData: classItem 
            })}
            style={styles.actionButton}
          >
            Detalhes
          </Button>
          
          {userProfile?.userType === 'student' && (
            <Button
              mode="contained"
              compact
              onPress={() => handleScheduleReminder(classItem, classItem.scheduleForDay[0])}
              style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
              icon="bell"
            >
              Lembrete
            </Button>
          )}
        </View>
      </Surface>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendário de Aulas</Text>
        <View style={styles.viewModeButtons}>
          {['month', 'week', 'day'].map(mode => (
            <Button
              key={mode}
              mode={viewMode === mode ? 'contained' : 'outlined'}
              compact
              onPress={() => setViewMode(mode)}
              style={styles.viewModeButton}
            >
              {mode === 'month' ? 'Mês' : mode === 'week' ? 'Semana' : 'Dia'}
            </Button>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Calendar */}
        <Card style={styles.calendarCard}>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            markingType="multi-dot"
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: themeColors.text,
              selectedDayBackgroundColor: themeColors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: themeColors.primary,
              dayTextColor: themeColors.text,
              textDisabledColor: '#d9e1e8',
              dotColor: themeColors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: themeColors.primary,
              monthTextColor: themeColors.text,
              indicatorColor: themeColors.primary,
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14
            }}
            style={styles.calendar}
          />
        </Card>

        {/* Selected Date Classes */}
        <Card style={styles.dayClassesCard}>
          <Card.Content>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>
                {new Date(selectedDate).toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </Text>
              <Chip mode="outlined" style={styles.classCount}>
                {dayClasses.length} aula{dayClasses.length !== 1 ? 's' : ''}
              </Chip>
            </View>
            
            {dayClasses.length > 0 ? (
              dayClasses.map(renderClassItem)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nenhuma aula agendada</Text>
                <Text style={styles.emptySubtext}>Selecione outro dia para ver as aulas</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Class Details Modal */}
      <Portal>
        <Modal 
          visible={showClassModal} 
          onDismiss={() => setShowClassModal(false)}
          contentContainerStyle={styles.modal}
        >
          {selectedClass && (
            <View>
              <Text style={styles.modalTitle}>{selectedClass.name}</Text>
              <Text style={styles.modalSubtitle}>{selectedClass.modality}</Text>
              
              <View style={styles.modalContent}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Horários</Text>
                  {selectedClass.scheduleForDay?.map((schedule, index) => (
                    <View key={index} style={styles.scheduleItem}>
                      <Text style={styles.scheduleTime}>{schedule.time}</Text>
                      <Text style={styles.scheduleDay}>{schedule.day}</Text>
                    </View>
                  ))}
                </View>
                
                {selectedClass.instructor && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Instrutor</Text>
                    <Text style={styles.modalText}>{selectedClass.instructor}</Text>
                  </View>
                )}
                
                {selectedClass.description && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Descrição</Text>
                    <Text style={styles.modalText}>{selectedClass.description}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.modalActions}>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowClassModal(false)}
                  style={styles.modalButton}
                >
                  Fechar
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => {
                    setShowClassModal(false);
                    navigation.navigate('ClassDetails', { 
                      classId: selectedClass.id, 
                      classData: selectedClass 
                    });
                  }}
                  style={[styles.modalButton, { backgroundColor: themeColors.primary }]}
                >
                  Ver Detalhes
                </Button>
              </View>
            </View>
          )}
        </Modal>
      </Portal>

      {/* FAB for adding classes (admin/instructor only) */}
      {(userProfile?.userType === 'admin' || userProfile?.userType === 'instructor') && (
        <FAB
          style={[styles.fab, { backgroundColor: themeColors.primary }]}
          icon="plus"
          onPress={() => navigation.navigate('CreateClass')}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewModeButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  viewModeButton: {
    minWidth: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  calendarCard: {
    marginBottom: 16,
    elevation: 4,
  },
  calendar: {
    paddingBottom: 16,
  },
  dayClassesCard: {
    marginBottom: 16,
    elevation: 4,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  classCount: {
    backgroundColor: '#f0f0f0',
  },
  classItem: {
    marginBottom: 12,
  },
  classCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  classModality: {
    fontSize: 14,
    color: '#666',
  },
  classTime: {
    alignItems: 'flex-end',
  },
  timeChip: {
    marginBottom: 4,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructorAvatar: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  instructorName: {
    fontSize: 14,
    color: '#666',
  },
  classActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
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
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  modalContent: {
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleDay: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default EnhancedCalendarScreen;
