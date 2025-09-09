import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Chip,
  Divider,
  Text,
  List,
  FAB,
  Searchbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { classService, studentService } from '../../services/firestoreService';

const InstructorClasses = ({ navigation }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [searchQuery, classes]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      console.log('📚 Carregando turmas do instrutor:', user.uid);
      
      // Primeiro, tentar buscar turmas do instrutor
      let instructorClasses = [];
      try {
        instructorClasses = await classService.getClassesByInstructor(user.uid, user?.email);
        console.log(`✅ ${instructorClasses.length} turmas encontradas`);
      } catch (classError) {
        console.warn('⚠️ Erro ao buscar turmas via service, tentando consulta direta:', classError);
        // Fallback: busca direta sem dependência do service
        try {
          instructorClasses = await firestoreService.getWhere('classes', 'instructorId', '==', user.uid);
          console.log(`✅ Fallback: ${instructorClasses.length} turmas encontradas`);
        } catch (fallbackError) {
          console.error('❌ Falha no fallback para turmas:', fallbackError);
          instructorClasses = [];
        }
      }
      
      // Buscar número de alunos para cada turma (com tratamento de erro)
      const classesWithStudents = await Promise.all(
        instructorClasses.map(async (classItem) => {
          try {
            const students = await studentService.getStudentsByClass(classItem.id);
            return {
              ...classItem,
              currentStudents: students.length,
              students: students
            };
          } catch (studentError) {
            console.warn(`⚠️ Erro ao buscar alunos da turma ${classItem.id}:`, studentError);
            return {
              ...classItem,
              currentStudents: 0,
              students: []
            };
          }
        })
      );
      
      setClasses(classesWithStudents);
      console.log(`✅ Dashboard carregado com ${classesWithStudents.length} turmas`);
    } catch (error) {
      console.error('Erro geral ao carregar turmas:', error);
      // Em caso de erro total, definir array vazio para evitar crash
      setClasses([]);
      Alert.alert('Aviso', 'Algumas informações podem estar limitadas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterClasses = () => {
    if (!searchQuery) {
      setFilteredClasses(classes);
      return;
    }
    
    const filtered = classes.filter(classItem =>
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.modality.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClasses(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadClasses();
  };

  const handleClassPress = (classItem) => {
    navigation.navigate('ClassDetails', { classId: classItem.id, classData: classItem });
  };

  const handleCheckIns = (classItem) => {
    navigation.navigate('CheckIns', { classId: classItem.id, className: classItem.name });
  };

  const formatSchedule = (classItem) => {
    try {
      const schedule = classItem?.schedule;
      if (Array.isArray(schedule) && schedule.length > 0) {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return schedule.map(s => 
          `${days[s.dayOfWeek]} ${String(s.hour ?? '').padStart(2, '0')}:${String(s.minute ?? 0).padStart(2, '0')}`
        ).join(', ');
      }
      if (typeof schedule === 'string' && schedule.trim()) {
        return schedule.trim();
      }
      if (typeof classItem?.scheduleText === 'string' && classItem.scheduleText.trim()) {
        return classItem.scheduleText.trim();
      }
      return 'Horário não definido';
    } catch (e) {
      return 'Horário não definido';
    }
  };

  const getCapacityColor = (current, max) => {
    if (!max) return '#666';
    const percentage = (current / max) * 100;
    if (percentage >= 90) return '#F44336';
    if (percentage >= 70) return '#FF9800';
    return '#4CAF50';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Buscar turmas..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredClasses.length > 0 ? (
          filteredClasses.map((classItem, index) => (
            <Card key={classItem.id || index} style={styles.classCard}>
              <Card.Content>
                <View style={styles.classHeader}>
                  <View style={styles.classInfo}>
                    <Title style={styles.className}>{classItem.name}</Title>
                    <Chip mode="outlined" style={styles.modalityChip}>
                      {classItem.modality}
                    </Chip>
                  </View>
                </View>

                <View style={styles.classDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {formatSchedule(classItem)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="people-outline" size={16} color="#666" />
                    <Text style={[
                      styles.detailText,
                      { color: getCapacityColor(classItem.currentStudents, classItem.maxCapacity) }
                    ]}>
                      {classItem.currentStudents}/{classItem.maxCapacity || 'N/A'} alunos
                    </Text>
                  </View>

                  {classItem.location && (
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={16} color="#666" />
                      <Text style={styles.detailText}>{classItem.location}</Text>
                    </View>
                  )}
                </View>

                <Divider style={styles.divider} />

                <View style={styles.classActions}>
                  <Button 
                    mode="outlined" 
                    onPress={() => handleClassPress(classItem)}
                    style={styles.actionButton}
                    icon="eye"
                  >
                    Ver Detalhes
                  </Button>

                  <Button 
                    mode="contained" 
                    onPress={() => handleCheckIns(classItem)}
                    style={styles.actionButton}
                    icon="check"
                  >
                    Check-ins
                  </Button>
                </View>

                {/* Lista rápida de alunos */}
                {classItem.students && classItem.students.length > 0 && (
                  <View style={styles.studentsPreview}>
                    <Text style={styles.studentsTitle}>Alunos da turma:</Text>
                    {classItem.students.slice(0, 3).map((student, idx) => (
                      <Text key={idx} style={styles.studentName}>
                        • {student.name}
                      </Text>
                    ))}
                    {classItem.students.length > 3 && (
                      <Text style={styles.moreStudents}>
                        +{classItem.students.length - 3} mais...
                      </Text>
                    )}
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="school-outline" size={48} color="#ccc" />
              <Title style={styles.emptyTitle}>Nenhuma turma encontrada</Title>
              <Paragraph style={styles.emptyText}>
                {searchQuery ? 
                  'Nenhuma turma corresponde à sua busca' : 
                  'Você ainda não possui turmas atribuídas'
                }
              </Paragraph>
            </Card.Content>
          </Card>
        )}

        {/* Estatísticas gerais */}
        {classes.length > 0 && (
          <Card style={styles.statsCard}>
            <Card.Content>
              <Title style={styles.statsTitle}>Resumo das Turmas</Title>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{classes.length}</Text>
                  <Text style={styles.statLabel}>Total de Turmas</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {classes.reduce((sum, c) => sum + (c.currentStudents || 0), 0)}
                  </Text>
                  <Text style={styles.statLabel}>Total de Alunos</Text>
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
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Nova Turma"
        onPress={() => Alert.alert('Info', 'Funcionalidade disponível apenas para administradores')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  classCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  classHeader: {
    marginBottom: 12,
  },
  classInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  className: {
    fontSize: 18,
    flex: 1,
  },
  modalityChip: {
    marginLeft: 8,
  },
  classDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    flex: 1,
  },
  divider: {
    marginVertical: 12,
  },
  classActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  studentsPreview: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  studentsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  moreStudents: {
    fontSize: 12,
    color: '#2196F3',
    fontStyle: 'italic',
  },
  emptyCard: {
    margin: 16,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
    backgroundColor: '#E8F5E8',
  },
  statsTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});

export default InstructorClasses;
