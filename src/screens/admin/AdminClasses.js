import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
  Searchbar,
  Menu,
  IconButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService, classService, studentService } from '../../services/firestoreService';
import ActionButton, { ActionButtonGroup } from '../../components/ActionButton';

const AdminClasses = ({ navigation }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  // Recarregar sempre que a tela ganhar foco (ex.: após excluir turma e voltar)
  useFocusEffect(
    React.useCallback(() => {
      loadClasses();
    }, [])
  );

  useEffect(() => {
    filterClasses();
  }, [searchQuery, selectedFilter, classes]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      
      // Buscar todas as turmas
      const allClasses = await firestoreService.getAll('classes');
      
      // Buscar informações adicionais para cada turma
      const classesWithDetails = await Promise.all(
        allClasses.map(async (classItem) => {
          try {
            // Buscar alunos da turma
            const students = await studentService.getStudentsByClass(classItem.id);
            
            // Buscar dados do instrutor
            const instructor = classItem.instructorId ? 
              await firestoreService.getById('users', classItem.instructorId) : null;
            
            return {
              ...classItem,
              currentStudents: students.length,
              students: students,
              instructorName: instructor?.name || 'Não atribuído'
            };
          } catch (error) {
            return {
              ...classItem,
              currentStudents: 0,
              students: [],
              instructorName: 'Não atribuído'
            };
          }
        })
      );
      
      setClasses(classesWithDetails);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as turmas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterClasses = () => {
    let filtered = classes;

    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(classItem =>
        classItem.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.modality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.instructorName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por status
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(c => c.isActive !== false);
        break;
      case 'inactive':
        filtered = filtered.filter(c => c.isActive === false);
        break;
      case 'full':
        filtered = filtered.filter(c => c.currentStudents >= (c.maxCapacity || 999));
        break;
      case 'empty':
        filtered = filtered.filter(c => c.currentStudents === 0);
        break;
      case 'no_instructor':
        filtered = filtered.filter(c => !c.instructorId);
        break;
      default:
        break;
    }

    setFilteredClasses(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadClasses();
  };

  const handleClassPress = (classItem) => {
    navigation.navigate('ClassDetails', { classId: classItem.id, classData: classItem });
  };

  const handleAddClass = () => {
    // Tenta navegar através do navigator do Stack pai, usando o ID definido
    const adminStackNav = navigation.getParent && navigation.getParent('AdminStack');
    if (adminStackNav && typeof adminStackNav.navigate === 'function') {
      adminStackNav.navigate('AddClass');
      return;
    }
    // Fallback 1: subir um nível (Tab) e depois tentar o Stack acima
    const parentNav = navigation.getParent && navigation.getParent();
    const grandParentNav = parentNav && parentNav.getParent ? parentNav.getParent() : null;
    if (grandParentNav && typeof grandParentNav.navigate === 'function') {
      grandParentNav.navigate('AddClass');
      return;
    }
    if (parentNav && typeof parentNav.navigate === 'function') {
      parentNav.navigate('AddClass');
      return;
    }
    // Fallback final
    navigation.navigate('AddClass');
  };

  const handleEditClass = (classItem) => {
    navigation.navigate('EditClass', { classId: classItem.id, classData: classItem });
  };

  const handleDeleteClass = (classItem) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir a turma ${classItem.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Remoção otimista da UI
              setClasses(prev => prev.filter(c => c.id !== classItem.id));
              setFilteredClasses(prev => prev.filter(c => c.id !== classItem.id));
              await firestoreService.delete('classes', classItem.id);
              // Garantir sincronização com servidor
              loadClasses();
              Alert.alert('Sucesso', 'Turma excluída com sucesso');
            } catch (error) {
              // Em caso de erro, recarregar lista para reverter remoção otimista
              loadClasses();
              Alert.alert('Erro', 'Não foi possível excluir a turma');
            }
          }
        }
      ]
    );
  };

  const formatSchedule = (classItem) => {
    // Suporta novo formato (array de objetos), legado (string) e scheduleText
    try {
      const schedule = classItem?.schedule;
      if (Array.isArray(schedule) && schedule.length > 0) {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return schedule.map((s) => {
          const day = typeof s.dayOfWeek === 'number' ? days[s.dayOfWeek] : 'Dia';
          const hour = (s.hour ?? '').toString().padStart(2, '0');
          const minute = (s.minute ?? 0).toString().padStart(2, '0');
          return `${day} ${hour}:${minute}`;
        }).join(', ');
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

  const getFilterText = (filter) => {
    const filters = {
      'all': 'Todas',
      'active': 'Ativas',
      'inactive': 'Inativas',
      'full': 'Lotadas',
      'empty': 'Vazias',
      'no_instructor': 'Sem Professor'
    };
    return filters[filter] || 'Todas';
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
        
        <View style={styles.filterRow}>
          <Menu
            visible={filterVisible}
            onDismiss={() => setFilterVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setFilterVisible(true)}
                icon="filter"
                style={styles.filterButton}
              >
                {getFilterText(selectedFilter)}
              </Button>
            }
          >
            <Menu.Item onPress={() => { setSelectedFilter('all'); setFilterVisible(false); }} title="Todas" />
            <Menu.Item onPress={() => { setSelectedFilter('active'); setFilterVisible(false); }} title="Ativas" />
            <Menu.Item onPress={() => { setSelectedFilter('inactive'); setFilterVisible(false); }} title="Inativas" />
            <Divider />
            <Menu.Item onPress={() => { setSelectedFilter('full'); setFilterVisible(false); }} title="Lotadas" />
            <Menu.Item onPress={() => { setSelectedFilter('empty'); setFilterVisible(false); }} title="Vazias" />
            <Menu.Item onPress={() => { setSelectedFilter('no_instructor'); setFilterVisible(false); }} title="Sem Professor" />
          </Menu>
        </View>
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
                  
                  <Menu
                    visible={false}
                    onDismiss={() => {}}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        onPress={() => handleClassPress(classItem)}
                      />
                    }
                  >
                    <Menu.Item onPress={() => handleEditClass(classItem)} title="Editar" />
                    <Menu.Item onPress={() => handleDeleteClass(classItem)} title="Excluir" />
                  </Menu>
                </View>

                <View style={styles.classDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="person-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Professor: {classItem.instructorName}
                    </Text>
                  </View>

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

                <View style={styles.statusRow}>
                  <Chip 
                    mode="outlined"
                    style={[
                      styles.statusChip,
                      { borderColor: classItem.isActive !== false ? '#4CAF50' : '#F44336' }
                    ]}
                    textStyle={{ 
                      color: classItem.isActive !== false ? '#4CAF50' : '#F44336',
                      fontSize: 12
                    }}
                  >
                    {classItem.isActive !== false ? 'Ativa' : 'Inativa'}
                  </Chip>

                  {classItem.currentStudents >= (classItem.maxCapacity || 999) && (
                    <Chip 
                      mode="outlined"
                      style={[styles.statusChip, { borderColor: '#F44336' }]}
                      textStyle={{ color: '#F44336', fontSize: 12 }}
                    >
                      Lotada
                    </Chip>
                  )}

                  {!classItem.instructorId && (
                    <Chip 
                      mode="outlined"
                      style={[styles.statusChip, { borderColor: '#FF9800' }]}
                      textStyle={{ color: '#FF9800', fontSize: 12 }}
                    >
                      Sem Professor
                    </Chip>
                  )}
                </View>

                <Divider style={styles.divider} />

                <ActionButtonGroup style={styles.classActions}>
                  <ActionButton 
                    mode="outlined" 
                    onPress={() => handleClassPress(classItem)}
                    style={styles.actionButton}
                    icon="eye"
                    variant="primary"
                    size="small"
                  >
                    Ver Detalhes
                  </ActionButton>

                  <ActionButton 
                    mode="outlined" 
                    onPress={() => handleEditClass(classItem)}
                    style={styles.actionButton}
                    icon="pencil"
                    variant="warning"
                    size="small"
                  >
                    Editar
                  </ActionButton>

                  <ActionButton 
                    mode="contained" 
                    onPress={() => navigation.navigate('ClassDetails', { classId: classItem.id, classData: classItem })}
                    style={styles.actionButton}
                    icon="account"
                    variant="success"
                    size="small"
                  >
                    Alunos
                  </ActionButton>
                </ActionButtonGroup>
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
                  'Nenhuma turma cadastrada ainda'
                }
              </Paragraph>
            </Card.Content>
          </Card>
        )}

        {/* Estatísticas gerais */}
        {classes.length > 0 && (
          <Card style={styles.statsCard}>
            <Card.Content>
              <Title style={styles.statsTitle}>Estatísticas das Turmas</Title>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{classes.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {classes.filter(c => c.isActive !== false).length}
                  </Text>
                  <Text style={styles.statLabel}>Ativas</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {classes.reduce((sum, c) => sum + (c.currentStudents || 0), 0)}
                  </Text>
                  <Text style={styles.statLabel}>Total Alunos</Text>
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
        onPress={handleAddClass}
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
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterButton: {
    borderColor: '#FF9800',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  statusChip: {
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 12,
  },
  classActions: {
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
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
    backgroundColor: '#FFF3E0',
  },
  statsTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
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
    backgroundColor: '#FF9800',
  },
});

export default AdminClasses;
