import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  FAB,
  Chip,
  Divider,
  Surface,
  Modal,
  Portal,
  TextInput,
  RadioButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../contexts/AuthProvider';
import { firestoreService } from '../../services/firestoreService';
import { getThemeColors } from '../../theme/professionalTheme';

const PaymentManagementScreen = ({ navigation }) => {
  const { user, userProfile, academia } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customDueDate, setCustomDueDate] = useState(new Date());
  
  const themeColors = getThemeColors(userProfile?.userType);

  useEffect(() => {
    loadPaymentData();
    loadPlans();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      
      // Buscar pagamentos do usuário
      const userPayments = await firestoreService.getDocuments(
        `gyms/${academia.id}/payments`,
        [{ field: 'userId', operator: '==', value: user.uid }],
        { field: 'createdAt', direction: 'desc' }
      );
      
      setPayments(userPayments);
      
      // Buscar plano atual
      const activePlan = userPayments.find(p => p.status === 'active');
      setCurrentPlan(activePlan);
      
    } catch (error) {
      console.error('Erro ao carregar dados de pagamento:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadPlans = async () => {
    try {
      const availablePlans = await firestoreService.getAll('plans');
      setPlans(availablePlans);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPaymentData();
    loadPlans();
  };

  const handleSelectPlan = async () => {
    if (!selectedPlan) {
      Alert.alert('Erro', 'Selecione um plano');
      return;
    }

    try {
      const paymentData = {
        userId: user.uid,
        userName: userProfile?.name || user.email,
        academiaId: academia.id,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: selectedPlan.value,
        dueDate: customDueDate,
        status: 'pending',
        createdAt: new Date(),
        paymentMethod: null,
        paidAt: null
      };

      await firestoreService.create(`gyms/${academia.id}/payments`, paymentData);
      
      Alert.alert(
        'Plano Selecionado!',
        `Plano ${selectedPlan.name} selecionado com sucesso. Vencimento: ${customDueDate.toLocaleDateString('pt-BR')}`,
        [{ text: 'OK', onPress: () => {
          setShowPlanModal(false);
          loadPaymentData();
        }}]
      );

    } catch (error) {
      console.error('Erro ao selecionar plano:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o plano');
    }
  };

  const handlePayment = (payment) => {
    Alert.alert(
      'Realizar Pagamento',
      `Confirmar pagamento de ${formatCurrency(payment.amount)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await firestoreService.update(`gyms/${academia.id}/payments`, payment.id, {
                status: 'paid',
                paidAt: new Date(),
                paymentMethod: 'app'
              });
              
              Alert.alert('Sucesso', 'Pagamento realizado com sucesso!');
              loadPaymentData();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível processar o pagamento');
            }
          }
        }
      ]
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('pt-BR');
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'paid': themeColors.success,
      'pending': '#FF9800',
      'overdue': '#F44336',
      'active': themeColors.primary
    };
    return colors[status] || '#666';
  };

  const getPaymentStatusText = (status) => {
    const texts = {
      'paid': 'Pago',
      'pending': 'Pendente',
      'overdue': 'Atrasado',
      'active': 'Ativo'
    };
    return texts[status] || status;
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const due = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Plano Atual */}
        {currentPlan && (
          <Card style={[styles.card, styles.currentPlanCard]}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="card" size={24} color={themeColors.primary} />
                <Text style={styles.cardTitle}>Plano Atual</Text>
                <Chip 
                  mode="flat"
                  style={[styles.statusChip, { backgroundColor: getPaymentStatusColor(currentPlan.status) }]}
                  textStyle={{ color: 'white', fontWeight: 'bold' }}
                >
                  {getPaymentStatusText(currentPlan.status)}
                </Chip>
              </View>
              
              <View style={styles.planDetails}>
                <Text style={styles.planName}>{currentPlan.planName}</Text>
                <Text style={styles.planValue}>{formatCurrency(currentPlan.amount)}</Text>
                
                {currentPlan.dueDate && (
                  <View style={styles.dueDateContainer}>
                    <Text style={styles.dueDateLabel}>Próximo vencimento:</Text>
                    <Text style={[
                      styles.dueDateValue,
                      { color: getDaysUntilDue(currentPlan.dueDate) <= 3 ? '#F44336' : '#666' }
                    ]}>
                      {formatDate(currentPlan.dueDate)}
                      {getDaysUntilDue(currentPlan.dueDate) !== null && (
                        <Text style={styles.daysLeft}>
                          {getDaysUntilDue(currentPlan.dueDate) > 0 
                            ? ` (${getDaysUntilDue(currentPlan.dueDate)} dias)`
                            : ' (Vencido)'
                          }
                        </Text>
                      )}
                    </Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Pagamentos Pendentes */}
        {payments.filter(p => p.status === 'pending' || p.status === 'overdue').length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="warning" size={24} color="#FF9800" />
                <Text style={styles.cardTitle}>Pagamentos Pendentes</Text>
              </View>
              
              {payments.filter(p => p.status === 'pending' || p.status === 'overdue').map((payment) => (
                <Surface key={payment.id} style={styles.paymentItem} elevation={1}>
                  <View style={styles.paymentInfo}>
                    <View style={styles.paymentDetails}>
                      <Text style={styles.paymentPlan}>{payment.planName}</Text>
                      <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                      <Text style={styles.paymentDue}>
                        Vence em: {formatDate(payment.dueDate)}
                      </Text>
                    </View>
                    <Button
                      mode="contained"
                      onPress={() => handlePayment(payment)}
                      style={[styles.payButton, { backgroundColor: themeColors.success }]}
                      icon="credit-card"
                    >
                      Pagar
                    </Button>
                  </View>
                </Surface>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Histórico de Pagamentos */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="time" size={24} color={themeColors.secondary} />
              <Text style={styles.cardTitle}>Histórico de Pagamentos</Text>
            </View>
            
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <View key={payment.id || index}>
                  <View style={styles.historyItem}>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyPlan}>{payment.planName}</Text>
                      <Text style={styles.historyAmount}>{formatCurrency(payment.amount)}</Text>
                      <Text style={styles.historyDate}>
                        {payment.paidAt ? `Pago em ${formatDate(payment.paidAt)}` : `Criado em ${formatDate(payment.createdAt)}`}
                      </Text>
                    </View>
                    <Chip 
                      mode="outlined"
                      style={[styles.historyStatus, { borderColor: getPaymentStatusColor(payment.status) }]}
                      textStyle={{ color: getPaymentStatusColor(payment.status) }}
                    >
                      {getPaymentStatusText(payment.status)}
                    </Chip>
                  </View>
                  {index < payments.length - 1 && <Divider />}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nenhum pagamento registrado</Text>
                <Text style={styles.emptySubtext}>Selecione um plano para começar</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* FAB para Selecionar Plano */}
      <FAB
        style={[styles.fab, { backgroundColor: themeColors.primary }]}
        icon="plus"
        label="Selecionar Plano"
        onPress={() => setShowPlanModal(true)}
      />

      {/* Modal de Seleção de Plano */}
      <Portal>
        <Modal 
          visible={showPlanModal} 
          onDismiss={() => setShowPlanModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Selecionar Plano</Text>
          
          <ScrollView style={styles.modalContent}>
            <RadioButton.Group
              onValueChange={(value) => {
                const plan = plans.find(p => p.id === value);
                setSelectedPlan(plan);
              }}
              value={selectedPlan?.id || ''}
            >
              {plans.map((plan) => (
                <Surface key={plan.id} style={styles.planOption} elevation={1}>
                  <View style={styles.planOptionContent}>
                    <RadioButton value={plan.id} />
                    <View style={styles.planOptionInfo}>
                      <Text style={styles.planOptionName}>{plan.name}</Text>
                      <Text style={styles.planOptionValue}>{formatCurrency(plan.value)}</Text>
                      {plan.description && (
                        <Text style={styles.planOptionDescription}>{plan.description}</Text>
                      )}
                    </View>
                  </View>
                </Surface>
              ))}
            </RadioButton.Group>
            
            {selectedPlan && (
              <View style={styles.dueDateSection}>
                <Text style={styles.dueDateSectionTitle}>Data de Vencimento</Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowDatePicker(true)}
                  icon="calendar"
                  style={styles.dateButton}
                >
                  {customDueDate.toLocaleDateString('pt-BR')}
                </Button>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.modalActions}>
            <Button 
              mode="outlined" 
              onPress={() => setShowPlanModal(false)}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSelectPlan}
              style={[styles.modalButton, { backgroundColor: themeColors.primary }]}
              disabled={!selectedPlan}
            >
              Confirmar
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={customDueDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setCustomDueDate(selectedDate);
            }
          }}
          minimumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  currentPlanCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  statusChip: {
    elevation: 2,
  },
  planDetails: {
    marginTop: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  dueDateContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  dueDateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dueDateValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  daysLeft: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  paymentItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentDetails: {
    flex: 1,
  },
  paymentPlan: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 4,
  },
  paymentDue: {
    fontSize: 14,
    color: '#666',
  },
  payButton: {
    borderRadius: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyPlan: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  historyStatus: {
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  planOption: {
    marginBottom: 12,
    borderRadius: 8,
  },
  planOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  planOptionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  planOptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  planOptionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  planOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
  dueDateSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  dueDateSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateButton: {
    borderColor: '#2196F3',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default PaymentManagementScreen;
