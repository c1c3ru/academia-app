import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Platform } from 'react-native';
import { 
  Card, 
  Text, 
  Button,
  Badge,
  Avatar,
  Icon,
  ListItem,
  Divider
} from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firestoreService } from '../../services/firestoreService';

const StudentDetailsScreen = ({ route, navigation }) => {
  const { studentId, studentData } = route.params || {};
  const [studentInfo, setStudentInfo] = useState(studentData || null);
  const [studentClasses, setStudentClasses] = useState([]);
  const [payments, setPayments] = useState([]);
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
      
    } catch (error) {
      console.error('Erro ao carregar detalhes do aluno:', error);
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

  if (loading && !studentInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando detalhes do aluno...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Informações do Aluno */}
        <Card containerStyle={styles.card}>
          <View style={styles.studentHeader}>
            <Avatar 
              size={80} 
              title={studentInfo?.name?.charAt(0) || 'A'}
              containerStyle={styles.avatar}
              titleStyle={styles.avatarText}
            />
            <View style={styles.studentInfo}>
              <Text h3 style={styles.studentName}>{studentInfo?.name || 'Aluno'}</Text>
              <Text style={styles.studentEmail}>{studentInfo?.email}</Text>
              <Badge 
                value={studentInfo?.isActive ? 'Ativo' : 'Inativo'}
                status={studentInfo?.isActive ? 'success' : 'error'}
                containerStyle={styles.statusBadge}
              />
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Icon name="phone" type="material" size={20} color="#666" />
              <Text style={styles.infoText}>
                {studentInfo?.phone || 'Telefone não informado'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="location-on" type="material" size={20} color="#666" />
              <Text style={styles.infoText}>
                {studentInfo?.address || 'Endereço não informado'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="event" type="material" size={20} color="#666" />
              <Text style={styles.infoText}>
                Cadastrado em: {formatDate(studentInfo?.createdAt)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Turmas Matriculadas */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="school" type="material" size={24} color="#2196F3" />
            <Text h4 style={styles.cardTitle}>Turmas Matriculadas</Text>
          </View>
          
          {studentClasses.length > 0 ? (
            studentClasses.map((classItem, index) => (
              <ListItem key={classItem.id || index} bottomDivider>
                <Icon name="fitness-center" type="material" />
                <ListItem.Content>
                  <ListItem.Title>{classItem.name}</ListItem.Title>
                  <ListItem.Subtitle>{classItem.modality}</ListItem.Subtitle>
                </ListItem.Content>
                <Button
                  title="Detalhes"
                  type="outline"
                  size="sm"
                  onPress={() => navigation.navigate('ClassDetails', { 
                    classId: classItem.id, 
                    classData: classItem 
                  })}
                />
              </ListItem>
            ))
          ) : (
            <Text style={styles.noDataText}>
              Nenhuma turma matriculada
            </Text>
          )}
        </Card>

        {/* Histórico de Pagamentos */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="payment" type="material" size={24} color="#4CAF50" />
            <Text h4 style={styles.cardTitle}>Histórico de Pagamentos</Text>
          </View>
          
          {payments.length > 0 ? (
            payments.slice(0, 5).map((payment, index) => (
              <ListItem key={payment.id || index} bottomDivider>
                <Icon name="receipt" type="material" />
                <ListItem.Content>
                  <ListItem.Title>
                    {formatCurrency(payment.amount)}
                  </ListItem.Title>
                  <ListItem.Subtitle>
                    {formatDate(payment.createdAt)}
                  </ListItem.Subtitle>
                </ListItem.Content>
                <Badge 
                  value={getPaymentStatusText(payment.status)}
                  badgeStyle={{ backgroundColor: getPaymentStatusColor(payment.status) }}
                />
              </ListItem>
            ))
          ) : (
            <Text style={styles.noDataText}>
              Nenhum pagamento registrado
            </Text>
          )}
          
          {payments.length > 5 && (
            <Button
              title="Ver Todos os Pagamentos"
              type="outline"
              onPress={() => navigation.navigate('StudentPayments', { studentId })}
              buttonStyle={styles.viewAllButton}
            />
          )}
        </Card>

        {/* Ações */}
        <Card containerStyle={styles.card}>
          <Text h4 style={styles.cardTitle}>Ações</Text>
          
          <View style={styles.actionsContainer}>
            <Button
              title="Editar Aluno"
              onPress={() => navigation.navigate('EditStudent', { 
                studentId, 
                studentData: studentInfo 
              })}
              buttonStyle={[styles.actionButton, { backgroundColor: '#2196F3' }]}
              icon={<Icon name="edit" type="material" size={20} color="white" />}
            />
            
            <Button
              title="Adicionar Graduação"
              onPress={() => navigation.navigate('AddGraduation', { 
                studentId, 
                studentName: studentInfo?.name 
              })}
              buttonStyle={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              icon={<Icon name="emoji-events" type="material" size={20} color="white" />}
            />
          </View>
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
  card: {
    margin: 16,
    marginTop: 8,
    ...Platform.select({

      ios: {},

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',

      },

    }),
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#2196F3',
  },
  avatarText: {
    color: 'white',
    fontWeight: '600',
  },
  studentInfo: {
    marginLeft: 16,
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  studentEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 16,
  },
  infoSection: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
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
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 16,
  },
  viewAllButton: {
    marginTop: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    width: '48%',
    borderRadius: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
});

export default StudentDetailsScreen;
