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
import { firestoreService, classService, studentService } from '../../services/firestoreService';

const InstructorClasses = ({ navigation }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentCounts, setStudentCounts] = useState({});

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
      
      // Buscar turmas do instrutor usando o service correto
      const classesData = await classService.getClassesByInstructor(user.uid, user?.email);
      setClasses(Array.isArray(classesData) ? classesData : []);
      console.log('✅', classesData.length, 'turmas encontradas');
      
      // Carregar contagem de alunos para cada turma
      await loadStudentCounts(classesData);
    } catch (error) {
      console.error('❌ Erro ao carregar turmas:', error);
      setClasses([]);
      Alert.alert('Erro', 'Não foi possível carregar as turmas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStudentCounts = async (classes) => {
    try {
      const counts = {};
      for (const classItem of classes) {
        try {
          const students = await studentService.getStudentsByClass(classItem.id);
          counts[classItem.id] = Array.isArray(students) ? students.length : 0;
        } catch (error) {
          console.warn(`⚠️ Erro ao carregar alunos da turma ${classItem.id}:`, error);
          counts[classItem.id] = 0;
        }
      }
      setStudentCounts(counts);
    } catch (error) {
      console.error('❌ Erro ao carregar contagens de alunos:', error);
    }
  };

  const filterClasses = () => {
    if (!searchQuery) {
      setFilteredClasses(classes);
      return;
    }
    
    const filtered = classes.filter(classItem =>
      classItem.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      classItem.modality?.toLowerCase()?.includes(searchQuery.toLowerCase())
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
    navigation.navigate('CheckIn', { 
      classId: classItem.id,
      className: classItem.name 
    });
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

  const renderClassCard = (classItem) => {
    const studentCount = studentCounts[classItem.id] || classItem.currentStudents || 0;
    
    return (
      <Card key={classItem.id} style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={styles.className}>{classItem.name}</Title>
            <Chip 
              style={[styles.statusChip, { backgroundColor: classItem.status === 'active' ? '#4CAF50' : '#FFC107' }]}
              textStyle={{ color: 'white', fontSize: 12 }}
            >
              {classItem.status === 'active' ? 'Ativa' : 'Inativa'}
            </Chip>
          </View>
          
          <Paragraph style={styles.modalityText}>
            <Ionicons name="fitness-outline" size={16} color="#666" />
            {' '}{classItem.modality}
          </Paragraph>
          
          <View style={styles.classInfo}>
            <Text style={styles.infoItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              {' '}{formatSchedule(classItem)}
            </Text>
            
            <Text style={styles.infoItem}>
              <Ionicons name="people-outline" size={16} color="#666" />
              {' '}{studentCount}/{classItem.maxStudents || 0} alunos
            </Text>
            
            {classItem.price && (
              <Text style={styles.infoItem}>
                <Ionicons name="card-outline" size={16} color="#666" />
                {' '}R$ {classItem.price.toFixed(2)}
              </Text>
            )}
          </View>

          {classItem.description && (
            <Paragraph style={styles.description}>{classItem.description}</Paragraph>
          )}
        </Card.Content>
        
        <Card.Actions style={styles.cardActions}>
          <Button 
            mode="outlined" 
            onPress={() => handleClassPress(classItem)}
            style={styles.actionButton}
          >
            Detalhes
          </Button>
          <Button 
            mode="contained" 
            onPress={() => handleCheckIns(classItem)}
            style={styles.actionButton}
          >
            Check-ins
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando turmas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Searchbar
        placeholder="Buscar turmas..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredClasses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Nenhuma turma encontrada' : 'Nenhuma turma cadastrada'}
            </Text>
            {!searchQuery && (
              <Text style={styles.emptySubtext}>
                Entre em contato com o administrador para criar turmas
              </Text>
            )}
          </View>
        ) : (
          filteredClasses.map(renderClassCard)
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Nova Turma"
        onPress={() => navigation.navigate('AddClass')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  className: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  statusChip: {
    height: 28,
  },
  modalityText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  classInfo: {
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
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