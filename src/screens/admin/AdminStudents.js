import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Avatar,
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
import { firestoreService, paymentService } from '../../services/firestoreService';
import StudentDisassociationDialog from '../../components/StudentDisassociationDialog';

const AdminStudents = ({ navigation }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDisassociationDialog, setShowDisassociationDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, selectedFilter, students]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os usuários do tipo student
      const allUsers = await firestoreService.getAll('users');
      const studentUsers = allUsers.filter(user => user.userType === 'student');
      
      // Buscar informações de pagamento para cada aluno
      const studentsWithPayments = await Promise.all(
        studentUsers.map(async (student) => {
          try {
            const payments = await paymentService.getPaymentsByStudent(student.id);
            const latestPayment = payments[0];
            return {
              ...student,
              paymentStatus: latestPayment?.status || 'unknown',
              lastPaymentDate: latestPayment?.createdAt,
              totalPayments: payments.length
            };
          } catch (error) {
            return {
              ...student,
              paymentStatus: 'unknown',
              totalPayments: 0
            };
          }
        })
      );
      
      setStudents(studentsWithPayments);
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
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.currentGraduation?.toLowerCase().includes(searchQuery.toLowerCase())
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
      case 'payment_ok':
        filtered = filtered.filter(s => s.paymentStatus === 'paid');
        break;
      case 'payment_pending':
        filtered = filtered.filter(s => s.paymentStatus === 'pending');
        break;
      case 'payment_overdue':
        filtered = filtered.filter(s => s.paymentStatus === 'overdue');
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
    navigation.navigate('StudentDetails', { studentId: student.id, studentData: student });
  };

  const handleAddStudent = () => {
    navigation.navigate('AddStudent');
  };

  const handleEditStudent = (student) => {
    navigation.navigate('EditStudent', { studentId: student.id, studentData: student });
  };

  const handleDisassociateStudent = (student) => {
    setSelectedStudent(student);
    setShowDisassociationDialog(true);
  };

  const handleDeleteStudent = (student) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o aluno ${student.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await firestoreService.delete('users', student.id);
              loadStudents();
              Alert.alert('Sucesso', 'Aluno excluído com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o aluno');
            }
          }
        }
      ]
    );
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
    const filters = {
      'all': 'Todos',
      'active': 'Ativos',
      'inactive': 'Inativos',
      'payment_ok': 'Pagamento OK',
      'payment_pending': 'Pagamento Pendente',
      'payment_overdue': 'Pagamento Atrasado'
    };
    return filters[filter] || 'Todos';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Buscar alunos..."
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
            <Menu.Item onPress={() => { setSelectedFilter('all'); setFilterVisible(false); }} title="Todos" />
            <Menu.Item onPress={() => { setSelectedFilter('active'); setFilterVisible(false); }} title="Ativos" />
            <Menu.Item onPress={() => { setSelectedFilter('inactive'); setFilterVisible(false); }} title="Inativos" />
            <Divider />
            <Menu.Item onPress={() => { setSelectedFilter('payment_ok'); setFilterVisible(false); }} title="Pagamento OK" />
            <Menu.Item onPress={() => { setSelectedFilter('payment_pending'); setFilterVisible(false); }} title="Pagamento Pendente" />
            <Menu.Item onPress={() => { setSelectedFilter('payment_overdue'); setFilterVisible(false); }} title="Pagamento Atrasado" />
          </Menu>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, index) => (
            <Card key={student.id || index} style={styles.studentCard}>
              <Card.Content>
                <View style={styles.studentHeader}>
                  <View style={styles.studentInfo}>
                    <Avatar.Text 
                      size={50} 
                      label={student.name?.charAt(0) || 'A'} 
                      style={styles.avatar}
                    />
                    <View style={styles.studentDetails}>
                      <Title style={styles.studentName}>{student.name}</Title>
                      <Text style={styles.studentEmail}>{student.email}</Text>
                      <Text style={styles.studentPhone}>{student.phone || 'Telefone não informado'}</Text>
                    </View>
                  </View>
                  
                  <Menu
                    visible={false}
                    onDismiss={() => {}}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        onPress={() => handleStudentPress(student)}
                      />
                    }
                  >
                    <Menu.Item onPress={() => handleEditStudent(student)} title="Editar" />
                    <Menu.Item onPress={() => handleDeleteStudent(student)} title="Excluir" />
                  </Menu>
                </View>

                <View style={styles.studentStats}>
                  <View style={styles.statColumn}>
                    <Text style={styles.statLabel}>Status</Text>
                    <Chip 
                      mode="outlined"
                      style={[
                        styles.statusChip,
                        { borderColor: student.isActive !== false ? '#4CAF50' : '#F44336' }
                      ]}
                      textStyle={{ 
                        color: student.isActive !== false ? '#4CAF50' : '#F44336',
                        fontSize: 12
                      }}
                    >
                      {student.isActive !== false ? 'Ativo' : 'Inativo'}
                    </Chip>
                  </View>

                  <View style={styles.statColumn}>
                    <Text style={styles.statLabel}>Pagamento</Text>
                    <Chip 
                      mode="outlined"
                      style={[
                        styles.statusChip,
                        { borderColor: getPaymentStatusColor(student.paymentStatus) }
                      ]}
                      textStyle={{ 
                        color: getPaymentStatusColor(student.paymentStatus),
                        fontSize: 12
                      }}
                    >
                      {getPaymentStatusText(student.paymentStatus)}
                    </Chip>
                  </View>

                  <View style={styles.statColumn}>
                    <Text style={styles.statLabel}>Graduação</Text>
                    <Text style={styles.graduationText}>
                      {student.currentGraduation || 'Iniciante'}
                    </Text>
                  </View>
                </View>

                <View style={styles.additionalInfo}>
                  <Text style={styles.infoText}>
                    Plano: {student.currentPlan || 'Não definido'}
                  </Text>
                  <Text style={styles.infoText}>
                    Total de pagamentos: {student.totalPayments}
                  </Text>
                  {student.lastPaymentDate && (
                    <Text style={styles.infoText}>
                      Último pagamento: {new Date(student.lastPaymentDate.seconds * 1000).toLocaleDateString('pt-BR')}
                    </Text>
                  )}
                </View>

                <Divider style={styles.divider} />

                <View style={styles.studentActions}>
                  <Button 
                    mode="outlined" 
                    onPress={() => handleStudentPress(student)}
                    style={styles.actionButton}
                    icon="eye"
                  >
                    Ver Perfil
                  </Button>

                  <Button 
                    mode="outlined" 
                    onPress={() => handleEditStudent(student)}
                    style={styles.actionButton}
                    icon="pencil"
                  >
                    Editar
                  </Button>

                  <Button 
                    mode="contained" 
                    onPress={() => navigation.navigate('StudentPayments', { studentId: student.id })}
                    style={styles.actionButton}
                    icon="cash"
                  >
                    Pagamentos
                  </Button>
                </View>

                {/* Ações Administrativas */}
                <View style={styles.adminActions}>
                  <Button 
                    mode="outlined" 
                    onPress={() => handleDisassociateStudent(student)}
                    style={[styles.actionButton, styles.disassociateButton]}
                    icon="account-remove"
                    textColor="#F44336"
                  >
                    Desassociar
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Title style={styles.emptyTitle}>Nenhum aluno encontrado</Title>
              <Paragraph style={styles.emptyText}>
                {searchQuery ? 
                  'Nenhum aluno corresponde à sua busca' : 
                  'Nenhum aluno cadastrado ainda'
                }
              </Paragraph>
            </Card.Content>
          </Card>
        )}

        {/* Estatísticas gerais */}
        {students.length > 0 && (
          <Card style={styles.statsCard}>
            <Card.Content>
              <Title style={styles.statsTitle}>Estatísticas Gerais</Title>
              
              <View style={styles.statsGrid}>
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
                  <Text style={styles.statLabel}>Pagamento OK</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {students.filter(s => s.paymentStatus === 'overdue').length}
                  </Text>
                  <Text style={styles.statLabel}>Atrasados</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Novo Aluno"
        onPress={handleAddStudent}
      />

      {/* Diálogo de Desassociação */}
      <StudentDisassociationDialog
        visible={showDisassociationDialog}
        onDismiss={() => {
          setShowDisassociationDialog(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onSuccess={() => {
          loadStudents();
          setShowDisassociationDialog(false);
          setSelectedStudent(null);
        }}
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
  studentCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
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
    backgroundColor: '#FF9800',
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
    marginBottom: 2,
  },
  studentPhone: {
    fontSize: 12,
    color: '#666',
  },
  studentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusChip: {
    borderWidth: 1,
  },
  graduationText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  additionalInfo: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
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
    marginHorizontal: 2,
  },
  adminActions: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  disassociateButton: {
    borderColor: '#F44336',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF9800',
  },
});

export default AdminStudents;
