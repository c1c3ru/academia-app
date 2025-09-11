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
  IconButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { firestoreService } from '../../services/firestoreService';

const StudentProfileScreen = ({ route, navigation }) => {
  const { studentId, studentData } = route.params || {};
  const { user } = useAuth();
  const { getString } = useTheme();
  const [studentInfo, setStudentInfo] = useState(studentData || null);
  const [studentClasses, setStudentClasses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [graduations, setGraduations] = useState([]);
  const [loading, setLoading] = useState(!studentData);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (studentId) {
      loadStudentDetails();
    }
  }, [studentId]);

  const loadStudentDetails = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do aluno se não foram passados
      if (!studentData) {
        const details = await firestoreService.getById('users', studentId);
        setStudentInfo(details);
      }
      
      // Buscar turmas do aluno
      const allClasses = await firestoreService.getAll('classes');
      const userClasses = allClasses.filter(cls => 
        studentInfo?.classIds && studentInfo.classIds.includes(cls.id)
      );
      setStudentClasses(userClasses);
      
      // Buscar pagamentos
      const allPayments = await firestoreService.getAll('payments');
      const userPayments = allPayments.filter(payment => 
        payment.userId === studentId
      ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPayments(userPayments);
      
      // Buscar graduações com tratamento robusto de erros
      try {
        const allGraduations = await firestoreService.getAll('graduations');
        const userGraduations = allGraduations.filter(graduation => 
          graduation.studentId === studentId
        ).sort((a, b) => new Date(b.date) - new Date(a.date));
        setGraduations(userGraduations);
      } catch (graduationError) {
        console.warn('Não foi possível carregar graduações:', graduationError.message);
        // Se for erro de permissão, não mostrar erro ao usuário, apenas log
        if (graduationError.code !== 'permission-denied') {
          console.error('Erro inesperado ao carregar graduações:', graduationError);
        }
        setGraduations([]);
      }
      
    } catch (error) {
      console.error('Erro ao carregar detalhes do aluno:', error);
      let errorMessage = 'Não foi possível carregar os detalhes do aluno';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Você não tem permissão para visualizar este perfil.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Serviço temporariamente indisponível. Tente novamente.';
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStudentDetails();
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'paid': '#4CAF50',
      'pending': '#FF9800',
      'overdue': '#F44336'
    };
    return colors[status] || '#666';
  };

  const getPaymentStatusText = (status) => {
    const texts = {
      'paid': 'Pago',
      'pending': 'Pendente',
      'overdue': 'Atrasado'
    };
    return texts[status] || status;
  };

  const formatDate = (date) => {
    if (!date) return 'Data não disponível';
    const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return dateObj.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const birth = birthDate.seconds ? new Date(birthDate.seconds * 1000) : new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading && !studentInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando perfil do aluno...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header do Perfil */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <Avatar.Text 
                size={80} 
                label={studentInfo?.name?.charAt(0) || 'A'} 
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Title style={styles.studentName}>{studentInfo?.name || 'Aluno'}</Title>
                <Text style={styles.studentEmail}>{studentInfo?.email}</Text>
                <View style={styles.statusContainer}>
                  <Chip 
                    mode="outlined"
                    style={[
                      styles.statusChip,
                      { borderColor: studentInfo?.isActive !== false ? '#4CAF50' : '#F44336' }
                    ]}
                    textStyle={{ 
                      color: studentInfo?.isActive !== false ? '#4CAF50' : '#F44336',
                      fontSize: 12
                    }}
                  >
                    {studentInfo?.isActive !== false ? 'Ativo' : 'Inativo'}
                  </Chip>
                  {studentInfo?.currentGraduation && (
                    <Chip 
                      mode="flat" 
                      style={styles.graduationChip}
                      textStyle={styles.graduationText}
                    >
                      {studentInfo.currentGraduation}
                    </Chip>
                  )}
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Informações Pessoais */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="account-circle" size={24} color="#2196F3" />
              <Title style={styles.cardTitle}>Informações Pessoais</Title>
            </View>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="phone" size={20} color="#666" />
                <Text style={styles.infoLabel}>Telefone:</Text>
                <Text style={styles.infoValue}>
                  {studentInfo?.phone || 'Não informado'}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
                <Text style={styles.infoLabel}>Endereço:</Text>
                <Text style={styles.infoValue}>
                  {studentInfo?.address || 'Não informado'}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                <Text style={styles.infoLabel}>Idade:</Text>
                <Text style={styles.infoValue}>
                  {calculateAge(studentInfo?.birthDate) || 'Não informado'} anos
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="calendar-plus" size={20} color="#666" />
                <Text style={styles.infoLabel}>Cadastrado em:</Text>
                <Text style={styles.infoValue}>
                  {formatDate(studentInfo?.createdAt)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Turmas Matriculadas */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="school" size={24} color="#4CAF50" />
              <Title style={styles.cardTitle}>Turmas Matriculadas</Title>
            </View>
            
            {studentClasses.length > 0 ? (
              studentClasses.map((classItem, index) => (
                <List.Item
                  key={classItem.id || index}
                  title={classItem.name}
                  description={`${classItem.modality} • ${classItem.schedule?.length || 0} horários`}
                  left={() => <List.Icon icon="dumbbell" color="#4CAF50" />}
                  right={() => (
                    <IconButton
                      icon="chevron-right"
                      onPress={() => navigation.navigate('ClassDetails', { 
                        classId: classItem.id, 
                        classData: classItem 
                      })}
                    />
                  )}
                />
              ))
            ) : (
              <Text style={styles.noDataText}>
                Nenhuma turma matriculada
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Histórico de Graduações */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
              <Title style={styles.cardTitle}>Histórico de Graduações</Title>
            </View>
            
            {graduations.length > 0 ? (
              graduations.map((graduation, index) => (
                <List.Item
                  key={graduation.id || index}
                  title={graduation.graduation}
                  description={`${graduation.modality} • ${formatDate(graduation.date)}`}
                  left={() => <List.Icon icon="medal" color="#FFD700" />}
                />
              ))
            ) : (
              <Text style={styles.noDataText}>
                Nenhuma graduação registrada
              </Text>
            )}
            
            <Button
              mode="contained"
              onPress={handleAddGraduation}
              style={styles.addButton}
              icon="plus"
            >
              Nova Graduação
            </Button>
          </Card.Content>
        </Card>

        {/* Histórico de Pagamentos */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="credit-card" size={24} color="#FF9800" />
              <Title style={styles.cardTitle}>Últimos Pagamentos</Title>
            </View>
            
            {payments.length > 0 ? (
              payments.slice(0, 5).map((payment, index) => (
                <List.Item
                  key={payment.id || index}
                  title={formatCurrency(payment.amount)}
                  description={formatDate(payment.createdAt)}
                  left={() => <List.Icon icon="receipt" color="#FF9800" />}
                  right={() => (
                    <Chip 
                      mode="outlined"
                      style={[
                        styles.paymentChip,
                        { borderColor: getPaymentStatusColor(payment.status) }
                      ]}
                      textStyle={{ 
                        color: getPaymentStatusColor(payment.status),
                        fontSize: 10
                      }}
                    >
                      {getPaymentStatusText(payment.status)}
                    </Chip>
                  )}
                />
              ))
            ) : (
              <Text style={styles.noDataText}>
                Nenhum pagamento registrado
              </Text>
            )}
            
            {payments.length > 5 && (
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('StudentPayments', { studentId })}
                style={styles.viewAllButton}
              >
                Ver Todos os Pagamentos
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Ações */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Ações</Title>
            
            <View style={styles.actionsContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('EditStudent', { 
                  studentId, 
                  studentData: studentInfo 
                })}
                style={styles.actionButton}
                icon="pencil"
              >
                Editar Aluno
              </Button>
              
              <Button
                mode="contained"
                onPress={() => navigation.navigate('AddGraduation', { 
                  studentId, 
                  studentName: studentInfo?.name 
                })}
                style={styles.actionButton}
                icon="trophy"
              >
                Nova Graduação
              </Button>
            </View>
          </Card.Content>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#2196F3',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    borderWidth: 1,
  },
  graduationChip: {
    backgroundColor: '#E8F5E8',
  },
  graduationText: {
    fontSize: 10,
    color: '#4CAF50',
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
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  addButton: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
  },
  paymentChip: {
    borderWidth: 1,
  },
  viewAllButton: {
    marginTop: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

export default StudentProfileScreen;
