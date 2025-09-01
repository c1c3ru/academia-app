import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity, Platform } from 'react-native';
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
import CustomMenu from '../../components/CustomMenu';
import { useAuth } from '../../contexts/AuthContext';
import { studentService, firestoreService } from '../../services/firestoreService';

const InstructorStudents = ({ navigation }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, selectedFilter, students]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const instructorStudents = await studentService.getStudentsByInstructor(user.uid);
      setStudents(instructorStudents);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os alunos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.currentGraduation && student.currentGraduation.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filtro por status
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(s => s.isActive !== false);
        break;
      case 'inactive':
        filtered = filtered.filter(s => s.isActive === false);
        break;
      case 'payment_pending':
        filtered = filtered.filter(s => s.paymentStatus === 'pending' || s.paymentStatus === 'overdue');
        break;
      default:
        break;
    }

    setFilteredStudents(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStudents();
  };

  const handleStudentPress = (student) => {
    navigation.navigate('StudentProfile', { studentId: student.id, studentData: student });
  };

  const handleAddGraduation = (student) => {
    navigation.navigate('AddGraduation', { studentId: student.id, studentName: student.name });
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'overdue': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Em dia';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Atrasado';
      default: return 'N/A';
    }
  };

  const getFilterText = (filter) => {
    switch (filter) {
      case 'all': return 'Todos';
      case 'active': return 'Ativos';
      case 'inactive': return 'Inativos';
      case 'payment_pending': return 'Pagamento Pendente';
      default: return 'Todos';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <SearchBar
          placeholder="Buscar alunos..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.filterRow}>
          <CustomMenu
            visible={filterVisible}
            onDismiss={() => setFilterVisible(false)}
            anchor={
              <Button 
                type="outline"
                onPress={() => setFilterVisible(true)}
                icon={<Icon name="filter" size={20} color="#666" />}
                buttonStyle={styles.filterButton}
              >
                {getFilterText(selectedFilter)}
              </Button>
            }
          >
            <CustomMenu.Item onPress={() => { setSelectedFilter('all'); setFilterVisible(false); }} title="Todos" />
            <CustomMenu.Item onPress={() => { setSelectedFilter('active'); setFilterVisible(false); }} title="Ativos" />
            <CustomMenu.Item onPress={() => { setSelectedFilter('inactive'); setFilterVisible(false); }} title="Inativos" />
            <CustomMenu.Item onPress={() => { setSelectedFilter('payment_pending'); setFilterVisible(false); }} title="Pagamento Pendente" />
          </CustomMenu>
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
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, index) => (
            <Card key={student.id || index} containerStyle={styles.studentCard}>
                <View style={styles.studentHeader}>
                  <View style={styles.studentInfo}>
                    <Avatar 
                      size={50} 
                      title={student.name?.charAt(0) || 'A'} 
                      containerStyle={styles.avatar}
                    />
                    <View style={styles.studentDetails}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.studentEmail}>{student.email}</Text>
                      {student.currentGraduation && (
                        <View style={[styles.graduationChip, styles.graduationText]}>
                          <Text style={styles.graduationText}>{student.currentGraduation}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => handleStudentPress(student)}
                    style={styles.iconButton}
                  >
                    <Ionicons name="ellipsis-vertical" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.studentStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Status</Text>
                    <View style={[
                      styles.statusChip,
                      { borderColor: student.isActive !== false ? '#4CAF50' : '#F44336' }
                    ]}>
                      <Text style={{ 
                        color: student.isActive !== false ? '#4CAF50' : '#F44336',
                        fontSize: 12
                      }}>
                        {student.isActive !== false ? 'Ativo' : 'Inativo'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Pagamento</Text>
                    <View style={[
                      styles.statusChip,
                      { borderColor: getPaymentStatusColor(student.paymentStatus) }
                    ]}>
                      <Text style={{ 
                        color: getPaymentStatusColor(student.paymentStatus),
                        fontSize: 12
                      }}>
                        {getPaymentStatusText(student.paymentStatus)}
                      </Text>
                    </View>
                  </View>
                </View>

                {student.graduations && student.graduations.length > 0 && (
                  <View style={styles.graduationsInfo}>
                    <Text style={styles.graduationsTitle}>Última graduação:</Text>
                    <Text style={styles.lastGraduation}>
                      {student.graduations[0]?.graduation} - {student.graduations[0]?.modality}
                    </Text>
                    <Text style={styles.graduationDate}>
                      {new Date(student.graduations[0]?.date).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                )}

                <Divider style={styles.divider} />

                <View style={styles.studentActions}>
                  <Button 
                    type="outline"
                    onPress={() => handleStudentPress(student)}
                    buttonStyle={styles.actionButton}
                    icon={<Icon name="visibility" type="material" size={20} color="#666" />}
                    title="Ver Perfil"
                  />

                  <Button 
                    type="solid"
                    onPress={() => handleAddGraduation(student)}
                    buttonStyle={styles.actionButton}
                    icon={<Icon name="emoji-events" type="material" size={20} color="white" />}
                    title="Graduação"
                  />
                </View>
            </Card>
          ))
        ) : (
          <Card containerStyle={styles.emptyCard}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyTitle}>Nenhum aluno encontrado</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 
                  'Nenhum aluno corresponde à sua busca' : 
                  'Você ainda não possui alunos atribuídos'
                }
              </Text>
          </Card>
        )}

        {/* Estatísticas gerais */}
        {students.length > 0 && (
          <Card containerStyle={styles.statsCard}>
              <Text style={styles.statsTitle}>Resumo dos Alunos</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{students.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {students.filter(s => s.isActive !== false).length}
                  </Text>
                  <Text style={styles.statLabel}>Ativos</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {students.filter(s => s.paymentStatus === 'paid').length}
                  </Text>
                  <Text style={styles.statLabel}>Em Dia</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {students.filter(s => s.graduations && s.graduations.length > 0).length}
                  </Text>
                  <Text style={styles.statLabel}>Com Graduação</Text>
                </View>
              </View>
          </Card>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => Alert.alert('Info', 'Funcionalidade disponível apenas para administradores')}
      >
        <Icon name="person-add" type="material" size={24} color="white" />
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
    ...Platform.select({

      ios: {},

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',

      },

    }),
  },
  searchbar: {
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterButton: {
    borderColor: '#4CAF50',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  studentCard: {
    margin: 16,
    marginBottom: 8,
    ...Platform.select({

      ios: {},

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',

      },

    }),
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: '#4CAF50',
  },
  studentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  graduationChip: {
    alignSelf: 'flex-start',
  },
  graduationText: {
    fontSize: 10,
  },
  studentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusChip: {
    borderWidth: 1,
  },
  graduationsInfo: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  graduationsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  lastGraduation: {
    fontSize: 14,
    marginBottom: 2,
  },
  graduationDate: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    marginVertical: 12,
  },
  studentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyCard: {
    margin: 16,
    ...Platform.select({

      ios: {},

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',

      },

    }),
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
    ...Platform.select({

      ios: {},

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',

      },

    }),
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
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});

export default InstructorStudents;
