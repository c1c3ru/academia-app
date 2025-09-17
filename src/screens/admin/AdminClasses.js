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
import { useAuth } from '../../contexts/AuthProvider';
import { useTheme } from '../../contexts/ThemeContext';
import { firestoreService, classService, studentService } from '../../services/firestoreService';
import ActionButton, { ActionButtonGroup } from '../../components/ActionButton';

const AdminClasses = ({ navigation }) => {
  const { user, userProfile, academia } = useAuth();
  const { getString } = useTheme();
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
      
      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error('Academia ID não encontrado');
        return;
      }
      
      // Buscar turmas da academia usando subcoleção
      const allClasses = await firestoreService.getAll(`gyms/${academiaId}/classes`);
      
      // Buscar informações adicionais para cada turma
      const classesWithDetails = await Promise.all(
        allClasses.map(async (classItem) => {
          try {
            // Buscar alunos da turma
            const students = await studentService.getStudentsByClass(classItem.id);
            
            // Buscar dados do instrutor na subcoleção de instrutores
            const instructor = classItem.instructorId ? 
              await firestoreService.getById(`gyms/${academiaId}/instructors`, classItem.instructorId) : null;
            
            return {
              ...classItem,
              currentStudents: students.length,
              students: students,
              instructorName: instructor?.name || getString('notAssigned')
            };
          } catch (error) {
            return {
              ...classItem,
              currentStudents: 0,
              students: [],
              instructorName: getString('notAssigned')
            };
          }
        })
      );
      
      setClasses(classesWithDetails);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      Alert.alert(getString('error'), getString('errorLoadingClasses'));
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
    // Navegar para o AdminStack pai para acessar ClassDetails
    const adminStackNav = navigation.getParent && navigation.getParent('AdminStack');
    if (adminStackNav && typeof adminStackNav.navigate === 'function') {
      adminStackNav.navigate('ClassDetails', { classId: classItem.id, classData: classItem });
      return;
    }
    // Fallback: tentar navegar pelo parent
    const parentNav = navigation.getParent && navigation.getParent();
    if (parentNav && typeof parentNav.navigate === 'function') {
      parentNav.navigate('ClassDetails', { classId: classItem.id, classData: classItem });
      return;
    }
    // Fallback final
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
    // Navegar para o AdminStack pai para acessar EditClass
    const adminStackNav = navigation.getParent && navigation.getParent('AdminStack');
    if (adminStackNav && typeof adminStackNav.navigate === 'function') {
      adminStackNav.navigate('EditClass', { classId: classItem.id, classData: classItem });
      return;
    }
    // Fallback: tentar navegar pelo parent
    const parentNav = navigation.getParent && navigation.getParent();
    if (parentNav && typeof parentNav.navigate === 'function') {
      parentNav.navigate('EditClass', { classId: classItem.id, classData: classItem });
      return;
    }
    // Fallback final
    navigation.navigate('EditClass', { classId: classItem.id, classData: classItem });
  };

  const handleDeleteClass = (classItem) => {
    Alert.alert(
      getString('confirmDeletion'),
      getString('confirmDeleteClass').replace('{className}', classItem.name),
      [
        { text: getString('cancel'), style: 'cancel' },
        { 
          text: getString('delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              // Remoção otimista da UI
              setClasses(prev => prev.filter(c => c.id !== classItem.id));
              setFilteredClasses(prev => prev.filter(c => c.id !== classItem.id));
              await firestoreService.delete('classes', classItem.id);
              // Garantir sincronização com servidor
              loadClasses();
              Alert.alert(getString('success'), getString('classDeletedSuccess'));
            } catch (error) {
              // Em caso de erro, recarregar lista para reverter remoção otimista
              loadClasses();
              Alert.alert(getString('error'), getString('errorDeletingClass'));
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
      return getString('scheduleNotDefined');
    } catch (e) {
      return getString('scheduleNotDefined');
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
      'all': getString('allClasses'),
      'active': getString('activeClasses'),
      'inactive': getString('inactiveClasses'),
      'full': getString('fullClasses'),
      'empty': getString('emptyClasses'),
      'no_instructor': getString('noInstructor')
    };
    return filters[filter] || getString('allClasses');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder={getString('searchClasses')}
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
            <Menu.Item onPress={() => { setSelectedFilter('all'); setFilterVisible(false); }} title={getString('allClasses')} />
            <Menu.Item onPress={() => { setSelectedFilter('active'); setFilterVisible(false); }} title={getString('activeClasses')} />
            <Menu.Item onPress={() => { setSelectedFilter('inactive'); setFilterVisible(false); }} title={getString('inactiveClasses')} />
            <Divider />
            <Menu.Item onPress={() => { setSelectedFilter('full'); setFilterVisible(false); }} title={getString('fullClasses')} />
            <Menu.Item onPress={() => { setSelectedFilter('empty'); setFilterVisible(false); }} title={getString('emptyClasses')} />
            <Menu.Item onPress={() => { setSelectedFilter('no_instructor'); setFilterVisible(false); }} title={getString('noInstructor')} />
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
                    <Menu.Item onPress={() => handleEditClass(classItem)} title={getString('edit')} />
                    <Menu.Item onPress={() => handleDeleteClass(classItem)} title={getString('delete')} />
                  </Menu>
                </View>

                <View style={styles.classDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="person-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {getString('professor')}: {classItem.instructorName}
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
                      {classItem.currentStudents}/{classItem.maxCapacity || 'N/A'} {getString('students')}
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
                    {classItem.isActive !== false ? getString('active') : getString('inactive')}
                  </Chip>

                  {classItem.currentStudents >= (classItem.maxCapacity || 999) && (
                    <Chip 
                      mode="outlined"
                      style={[styles.statusChip, { borderColor: '#F44336' }]}
                      textStyle={{ color: '#F44336', fontSize: 12 }}
                    >
                      {getString('full')}
                    </Chip>
                  )}

                  {!classItem.instructorId && (
                    <Chip 
                      mode="outlined"
                      style={[styles.statusChip, { borderColor: '#FF9800' }]}
                      textStyle={{ color: '#FF9800', fontSize: 12 }}
                    >
                      {getString('withoutInstructor')}
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
                    {getString('viewDetails')}
                  </ActionButton>

                  <ActionButton 
                    mode="outlined" 
                    onPress={() => handleEditClass(classItem)}
                    style={styles.actionButton}
                    icon="pencil"
                    variant="warning"
                    size="small"
                  >
                    {getString('edit')}
                  </ActionButton>

                  <ActionButton 
                    mode="contained" 
                    onPress={() => handleClassPress(classItem)}
                    style={styles.actionButton}
                    icon="account"
                    variant="success"
                    size="small"
                  >
                    {getString('studentsTab')}
                  </ActionButton>
                </ActionButtonGroup>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="school-outline" size={48} color="#ccc" />
              <Title style={styles.emptyTitle}>{getString('noClassesFound')}</Title>
              <Paragraph style={styles.emptyText}>
                {searchQuery ? 
                  getString('noMatchingClasses') : 
                  getString('noClassesRegistered')
                }
              </Paragraph>
            </Card.Content>
          </Card>
        )}

        {/* Estatísticas gerais */}
        {classes.length > 0 && (
          <Card style={styles.statsCard}>
            <Card.Content>
              <Title style={styles.statsTitle}>{getString('classStatistics')}</Title>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{classes.length}</Text>
                  <Text style={styles.statLabel}>{getString('total')}</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {classes.filter(c => c.isActive !== false).length}
                  </Text>
                  <Text style={styles.statLabel}>{getString('activeClasses')}</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {classes.reduce((sum, c) => sum + (c.currentStudents || 0), 0)}
                  </Text>
                  <Text style={styles.statLabel}>{getString('totalStudents')}</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {[...new Set(classes.map(c => c.modality))].length}
                  </Text>
                  <Text style={styles.statLabel}>{getString('modalities')}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label={getString('newClass')}
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
