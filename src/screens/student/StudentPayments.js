import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { 
  Card, 
  Text, 
  Button,
  Badge,
  Icon,
  ListItem,
  Divider
} from 'react-native-elements';
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Atual */}
        {currentPayment && (
          <Card containerStyle={styles.currentCard}>
              <View style={styles.cardHeader}>
                <Icon name="card-outline" type="ionicon" size={24} color="#2196F3" />
                <Text h4 style={styles.cardTitle}>Mensalidade Atual</Text>
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
                  <Badge 
                    value={getStatusText(currentPayment.status)}
                    badgeStyle={[styles.statusChip, { backgroundColor: getStatusColor(currentPayment.status) }]}
                    textStyle={{ color: 'white' }}
                  />
                </View>
              </View>

              {currentPayment.status === 'pending' && (
                <Button 
                  onPress={handlePayWithPix}
                  buttonStyle={styles.payButton}
                  icon={<Icon name="qr-code" type="ionicon" size={16} color="white" />}
                  title="Pagar com PIX"
                />
              )}
          </Card>
        )}

        {/* Histórico de Pagamentos */}
        <Card containerStyle={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="time-outline" type="ionicon" size={24} color="#2196F3" />
              <Text h4 style={styles.cardTitle}>Histórico de Pagamentos</Text>
            </View>
            
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <View key={payment.id || index}>
                  <ListItem>
                    <Icon name="receipt" type="ionicon" color={getStatusColor(payment.status)} />
                    <ListItem.Content>
                      <ListItem.Title>{`${payment.planName || 'Mensalidade'} - ${formatCurrency(payment.amount)}`}</ListItem.Title>
                      <ListItem.Subtitle>{`Vencimento: ${formatDate(payment.dueDate)}`}</ListItem.Subtitle>
                    </ListItem.Content>
                    <Badge 
                      value={getStatusText(payment.status)}
                      badgeStyle={[styles.listStatusChip, { backgroundColor: getStatusColor(payment.status) }]}
                      textStyle={{ color: 'white', fontSize: 12 }}
                    />
                  </ListItem>
                  {index < payments.length - 1 && <Divider />}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                Nenhum pagamento encontrado
              </Text>
            )}
        </Card>

        {/* Informações Adicionais */}
        <Card containerStyle={styles.card}>
            <Text h4 style={styles.cardTitle}>Informações</Text>
            <Text style={styles.infoText}>
              • Os pagamentos devem ser realizados até a data de vencimento
            </Text>
            <Text style={styles.infoText}>
              • Após o vencimento, será cobrada multa de 2% + juros de 1% ao mês
            </Text>
            <Text style={styles.infoText}>
              • Em caso de dúvidas, entre em contato com a administração
            </Text>
        </Card>
      </ScrollView>

      {/* Botão de Contato */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => Alert.alert('Contato', 'Funcionalidade de contato será implementada')}
      >
        <Icon name="chatbubble" type="ionicon" size={24} color="white" />
      </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: 100,
  },
  currentCard: {
    margin: 16,
    marginBottom: 8,
    ...Platform.select({

      ios: {

        shadowColor: '#000',

        shadowOffset: { width: 0, height: 2 },

        shadowOpacity: 0.1,

        shadowRadius: 4,

      },

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',

      },

    }),
    backgroundColor: '#E3F2FD',
  },
  card: {
    margin: 16,
    marginTop: 8,
    ...Platform.select({

      ios: {

        shadowColor: '#000',

        shadowOffset: { width: 0, height: 2 },

        shadowOpacity: 0.1,

        shadowRadius: 4,

      },

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',

      },

    }),
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
