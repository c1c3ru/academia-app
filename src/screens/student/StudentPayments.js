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
  FAB,
  List
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService } from '../../services/firestoreService';

const StudentPayments = ({ navigation }) => {
  const { user, userProfile } = useAuth();
  const [payments, setPayments] = useState([]);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const userPayments = await paymentService.getPaymentsByStudent(user.uid);
      setPayments(userPayments);
      
      // Encontrar pagamento atual (mais recente)
      const current = userPayments.find(p => p.status === 'pending') || userPayments[0];
      setCurrentPayment(current);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os pagamentos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const handlePayWithPix = () => {
    Alert.alert(
      'Pagamento PIX',
      'Funcionalidade de pagamento PIX será implementada em breve',
      [{ text: 'OK' }]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'overdue': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Atrasado';
      default: return 'Não informado';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'Data não informada';
    return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString('pt-BR');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Atual */}
        {currentPayment && (
          <Card style={styles.currentCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="card-outline" size={24} color="#2196F3" />
                <Title style={styles.cardTitle}>Mensalidade Atual</Title>
              </View>
              
              <View style={styles.currentPaymentInfo}>
                <View style={styles.paymentRow}>
                  <Text style={styles.label}>Plano:</Text>
                  <Text style={styles.value}>{currentPayment.planName || 'Mensal'}</Text>
                </View>
                
                <View style={styles.paymentRow}>
                  <Text style={styles.label}>Valor:</Text>
                  <Text style={styles.value}>{formatCurrency(currentPayment.amount)}</Text>
                </View>
                
                <View style={styles.paymentRow}>
                  <Text style={styles.label}>Vencimento:</Text>
                  <Text style={styles.value}>{formatDate(currentPayment.dueDate)}</Text>
                </View>
                
                <View style={styles.paymentRow}>
                  <Text style={styles.label}>Status:</Text>
                  <Chip 
                    mode="outlined"
                    style={[styles.statusChip, { borderColor: getStatusColor(currentPayment.status) }]}
                    textStyle={{ color: getStatusColor(currentPayment.status) }}
                  >
                    {getStatusText(currentPayment.status)}
                  </Chip>
                </View>
              </View>

              {currentPayment.status === 'pending' && (
                <Button 
                  mode="contained" 
                  onPress={handlePayWithPix}
                  style={styles.payButton}
                  icon="qrcode"
                >
                  Pagar com PIX
                </Button>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Histórico de Pagamentos */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={24} color="#2196F3" />
              <Title style={styles.cardTitle}>Histórico de Pagamentos</Title>
            </View>
            
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <View key={payment.id || index}>
                  <List.Item
                    title={`${payment.planName || 'Mensalidade'} - ${formatCurrency(payment.amount)}`}
                    description={`Vencimento: ${formatDate(payment.dueDate)}`}
                    left={() => (
                      <List.Icon 
                        icon="receipt" 
                        color={getStatusColor(payment.status)}
                      />
                    )}
                    right={() => (
                      <Chip 
                        mode="outlined"
                        style={[styles.listStatusChip, { borderColor: getStatusColor(payment.status) }]}
                        textStyle={{ color: getStatusColor(payment.status), fontSize: 12 }}
                      >
                        {getStatusText(payment.status)}
                      </Chip>
                    )}
                  />
                  {index < payments.length - 1 && <Divider />}
                </View>
              ))
            ) : (
              <Paragraph style={styles.emptyText}>
                Nenhum pagamento encontrado
              </Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Informações Adicionais */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Informações</Title>
            <Paragraph style={styles.infoText}>
              • Os pagamentos devem ser realizados até a data de vencimento
            </Paragraph>
            <Paragraph style={styles.infoText}>
              • Após o vencimento, será cobrada multa de 2% + juros de 1% ao mês
            </Paragraph>
            <Paragraph style={styles.infoText}>
              • Em caso de dúvidas, entre em contato com a administração
            </Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Botão de Contato */}
      <FAB
        style={styles.fab}
        icon="message"
        label="Contato"
        onPress={() => Alert.alert('Contato', 'Funcionalidade de contato será implementada')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  currentCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
    backgroundColor: '#E3F2FD',
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
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
  currentPaymentInfo: {
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusChip: {
    borderWidth: 1,
  },
  listStatusChip: {
    borderWidth: 1,
    height: 24,
  },
  payButton: {
    backgroundColor: '#4CAF50',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  infoText: {
    marginBottom: 8,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

export default StudentPayments;
