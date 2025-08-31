import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Animated, Easing, TouchableOpacity, ActivityIndicator } from 'react-native';
import { 
  Card, 
  Text, 
  Button,
  Badge,
  Avatar,
  Icon,
  ListItem,
  Divider,
  SearchBar
} from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService, classService, studentService } from '../../services/firestoreService';

const AdminClasses = ({ navigation }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const listIntro = useRef(new Animated.Value(0)).current;
  const itemAnimations = useRef([]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [searchQuery, selectedFilter, classes]);

  useEffect(() => {
    // anima entrada da lista
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    // animação per-item
    itemAnimations.current = filteredClasses.map(() => new Animated.Value(0));
    Animated.stagger(
      60,
      itemAnimations.current.map(v =>
        Animated.timing(v, { toValue: 1, duration: 350, easing: Easing.out(Easing.ease), useNativeDriver: false })
      )
    ).start();
  }, [filteredClasses]);

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
      setSnackbarMsg('Não foi possível carregar as turmas');
      setSnackbarVisible(true);
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
              await firestoreService.delete('classes', classItem.id);
              loadClasses();
              setSnackbarMsg('Turma excluída com sucesso');
              setSnackbarVisible(true);
            } catch (error) {
              setSnackbarMsg('Não foi possível excluir a turma');
              setSnackbarVisible(true);
            }
          }
        }
      ]
    );
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
        <SearchBar
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator animating size={28} />
          </View>
        )}

        {!loading && filteredClasses.length > 0 ? (
          filteredClasses.map((classItem, index) => (
            <Animated.View
              key={classItem.id || index}
              style={{
                opacity: itemAnimations.current[index] || 1,
                transform: [{ translateY: (itemAnimations.current[index] ? itemAnimations.current[index].interpolate({ inputRange: [0,1], outputRange: [12,0] }) : 0) }]
              }}
            >
              <Card style={styles.classCard}>
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
                      <Ionicons name="person-outline" size={16} color="#9ca3af" />
                      <Text style={styles.detailText}>
                        Professor: {classItem.instructorName}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={16} color="#9ca3af" />
                      <Text style={styles.detailText}>
                        {formatSchedule(classItem.schedule)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="people-outline" size={16} color="#9ca3af" />
                      <Text style={[
                        styles.detailText,
                        { color: getCapacityColor(classItem.currentStudents, classItem.maxCapacity) }
                      ]}>
                        {classItem.currentStudents}/{classItem.maxCapacity || 'N/A'} alunos
                      </Text>
                    </View>

                    {classItem.location && (
                      <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color="#9ca3af" />
                        <Text style={styles.detailText}>{classItem.location}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.statusRow}>
                    <Chip 
                      mode="outlined"
                      style={[
                        styles.statusChip,
                        { borderColor: classItem.isActive !== false ? '#34d399' : '#f87171' }
                      ]}
                      textStyle={{ 
                        color: classItem.isActive !== false ? '#34d399' : '#f87171',
                        fontSize: 12
                      }}
                    >
                      {classItem.isActive !== false ? 'Ativa' : 'Inativa'}
                    </Chip>

                    {classItem.currentStudents >= (classItem.maxCapacity || 999) && (
                      <Chip 
                        mode="outlined"
                        style={[styles.statusChip, { borderColor: '#f87171' }]}
                        textStyle={{ color: '#f87171', fontSize: 12 }}
                      >
                        Lotada
                      </Chip>
                    )}

                    {!classItem.instructorId && (
                      <Chip 
                        mode="outlined"
                        style={[styles.statusChip, { borderColor: '#f59e0b' }]}
                        textStyle={{ color: '#f59e0b', fontSize: 12 }}
                      >
                        Sem Professor
                      </Chip>
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
                      mode="outlined" 
                      onPress={() => handleEditClass(classItem)}
                      style={styles.actionButton}
                      icon="pencil"
                    >
                      Editar
                    </Button>

                    <Button 
                      mode="contained" 
                      onPress={() => navigation.navigate('ClassStudents', { classId: classItem.id })}
                      style={styles.actionButton}
                      buttonColor="#2563eb"
                      textColor="#fff"
                      icon="account"
                    >
                      Alunos
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            </Animated.View>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="school-outline" size={48} color="#6b7280" />
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

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
        action={{ label: 'OK', onPress: () => setSnackbarVisible(false) }}
      >
        {snackbarMsg}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 16,
    backgroundColor: '#0b1220',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1f2937',
  },
  searchbar: {
    backgroundColor: '#111827',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1f2937',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterButton: {
    borderColor: '#2563eb',
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
    boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1f2937',
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
    color: '#e5e7eb',
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
    color: '#9ca3af',
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
    backgroundColor: '#1f2937',
  },
  classActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 2,
  },
  emptyCard: {
    margin: 16,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    backgroundColor: '#0b1220',
    borderRadius: 16,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
    color: '#e5e7eb',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    backgroundColor: '#0b1220',
    borderRadius: 16,
  },
  statsTitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#e5e7eb',
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
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2563eb',
  },
  loadingWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  snackbar: {
    backgroundColor: '#111827',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1f2937',
  },
});

export default AdminClasses;
