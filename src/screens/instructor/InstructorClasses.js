import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity, TextInput } from 'react-native';
import { 
  Card, 
  Text, 
  Button,
  Badge,
  Icon,
  ListItem,
  Divider,
  SearchBar
} from 'react-native-elements';
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
      const instructorClasses = await classService.getClassesByInstructor(user.uid);
      
      // Buscar número de alunos para cada turma
      const classesWithStudents = await Promise.all(
        instructorClasses.map(async (classItem) => {
          const students = await studentService.getStudentsByClass(classItem.id);
          return {
            ...classItem,
            currentStudents: students.length,
            students: students
          };
        })
      );
      
      setClasses(classesWithStudents);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as turmas');
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

  const formatSchedule = (schedule) => {
    if (!schedule || schedule.length === 0) return 'Horário não definido';
    
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return schedule.map(s => 
      `${days[s.dayOfWeek]} ${s.hour.toString().padStart(2, '0')}:${(s.minute || 0).toString().padStart(2, '0')}`
    ).join(', ');
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
        <SearchBar
          placeholder="Buscar turmas..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          containerStyle={styles.searchbar}
          inputContainerStyle={styles.searchInput}
        />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredClasses.length > 0 ? (
          filteredClasses.map((classItem, index) => (
            <Card key={classItem.id || index} containerStyle={styles.classCard}>
                <View style={styles.classHeader}>
                  <View style={styles.classInfo}>
                    <Text h4 style={styles.className}>{classItem.name}</Text>
                    <Badge value={classItem.modality} badgeStyle={styles.modalityChip} textStyle={styles.modalityText} />
                  </View>
                </View>

                <View style={styles.classDetails}>
                  <View style={styles.detailRow}>
                    <Icon name="time-outline" type="ionicon" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {formatSchedule(classItem.schedule)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Icon name="people-outline" type="ionicon" size={16} color="#666" />
                    <Text style={[
                      styles.detailText,
                      { color: getCapacityColor(classItem.currentStudents, classItem.maxCapacity) }
                    ]}>
                      {classItem.currentStudents}/{classItem.maxCapacity || 'N/A'} alunos
                    </Text>
                  </View>

                  {classItem.location && (
                    <View style={styles.detailRow}>
                      <Icon name="location-outline" type="ionicon" size={16} color="#666" />
                      <Text style={styles.detailText}>{classItem.location}</Text>
                    </View>
                  )}
                </View>

                <Divider style={styles.divider} />

                <View style={styles.classActions}>
                  <Button 
                    type="outline" 
                    onPress={() => handleClassPress(classItem)}
                    buttonStyle={styles.actionButton}
                    icon={<Icon name="eye" type="ionicon" size={16} color="#2196F3" />}
                    title="Ver Detalhes"
                  />

                  <Button 
                    onPress={() => handleCheckIns(classItem)}
                    buttonStyle={styles.actionButton}
                    icon={<Icon name="checkmark" type="ionicon" size={16} color="white" />}
                    title="Check-ins"
                  />
                </View>
            </Card>
          ))
        ) : (
          <Card containerStyle={styles.emptyCard}>
              <Icon name="school-outline" type="ionicon" size={48} color="#ccc" />
              <Text h4 style={styles.emptyTitle}>Nenhuma turma encontrada</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 
                  'Nenhuma turma corresponde à sua busca' : 
                  'Você ainda não possui turmas atribuídas'
                }
              </Text>
          </Card>
        )}

        {/* Estatísticas gerais */}
        {classes.length > 0 && (
          <Card containerStyle={styles.statsCard}>
              <Text h4 style={styles.statsTitle}>Resumo das Turmas</Text>
              
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
          </Card>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => Alert.alert('Info', 'Funcionalidade disponível apenas para administradores')}
      >
        <Icon name="add" type="ionicon" size={24} color="white" />
      </TouchableOpacity>
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
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  searchbar: {
    backgroundColor: '#f5f5f5',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  searchInput: {
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  classCard: {
    margin: 16,
    marginBottom: 8,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  modalityChip: {
    backgroundColor: '#2196F3',
    marginLeft: 8,
  },
  modalityText: {
    color: 'white',
    fontSize: 12,
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
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
