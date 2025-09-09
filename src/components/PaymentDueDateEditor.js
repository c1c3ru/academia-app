import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { 
  Modal, 
  Portal, 
  Card, 
  Title, 
  Button, 
  TextInput,
  Text,
  Divider
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { firestoreService } from '../services/firestoreService';

const PaymentDueDateEditor = ({ visible, onDismiss, currentPayment, onUpdate }) => {
  const { user, userProfile, academia } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [newDueDate, setNewDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDateInput = (text) => {
    // Remove caracteres não numéricos
    const numbers = text.replace(/\D/g, '');
    
    // Aplica máscara DD/MM/AAAA
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  const validateDate = (dateString) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(regex);
    
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < new Date().getFullYear()) return false;
    
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
  };

  const handleSave = async () => {
    if (!newDueDate.trim()) {
      showError('Por favor, informe a nova data de vencimento');
      return;
    }

    if (!validateDate(newDueDate)) {
      showError('Data inválida. Use o formato DD/MM/AAAA');
      return;
    }

    try {
      setLoading(true);
      
      // Converter data para formato Date
      const [day, month, year] = newDueDate.split('/');
      const dueDate = new Date(year, month - 1, day);
      
      // Atualizar pagamento no Firestore
      await firestoreService.update(`academias/${academia.id}/payments`, currentPayment.id, {
        dueDate: dueDate,
        dueDateChangedBy: user.uid,
        dueDateChangedAt: new Date(),
        dueDateChangeReason: 'Alterado pelo aluno'
      });

      // Notificar administradores sobre a alteração
      await notifyAdminsAboutDateChange(currentPayment, dueDate);

      showSuccess('Data de vencimento atualizada com sucesso');
      onUpdate();
      onDismiss();
      setNewDueDate('');
      
    } catch (error) {
      console.error('Erro ao atualizar data de vencimento:', error);
      showError('Erro ao atualizar data de vencimento');
    } finally {
      setLoading(false);
    }
  };

  const notifyAdminsAboutDateChange = async (payment, newDate) => {
    try {
      // Buscar administradores da academia
      const admins = await firestoreService.getWhere(
        `academias/${academia.id}/usuarios`,
        'role',
        'admin'
      );

      // Criar notificação para cada administrador
      const notificationPromises = admins.map(admin => 
        firestoreService.create(`academias/${academia.id}/notifications`, {
          userId: admin.id,
          type: 'payment_date_change',
          title: 'Data de Vencimento Alterada',
          message: `${userProfile.name} alterou a data de vencimento do pagamento para ${newDate.toLocaleDateString('pt-BR')}`,
          data: {
            studentId: user.uid,
            studentName: userProfile.name,
            paymentId: payment.id,
            oldDate: payment.dueDate,
            newDate: newDate,
            planName: payment.planName || 'Mensalidade'
          },
          read: false,
          priority: 'medium'
        })
      );

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Erro ao notificar administradores:', error);
    }
  };

  const formatCurrentDate = (date) => {
    if (!date) return 'Data não informada';
    const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return dateObj.toLocaleDateString('pt-BR');
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Ionicons name="calendar-outline" size={24} color="#2196F3" />
              <Title style={styles.title}>Alterar Data de Vencimento</Title>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.currentInfo}>
              <Text style={styles.label}>Data atual:</Text>
              <Text style={styles.currentDate}>
                {formatCurrentDate(currentPayment?.dueDate)}
              </Text>
            </View>

            <View style={styles.planInfo}>
              <Text style={styles.label}>Plano:</Text>
              <Text style={styles.planName}>
                {currentPayment?.planName || 'Mensalidade'}
              </Text>
            </View>

            <TextInput
              label="Nova data de vencimento"
              value={newDueDate}
              onChangeText={(text) => setNewDueDate(formatDateInput(text))}
              placeholder="DD/MM/AAAA"
              keyboardType="numeric"
              maxLength={10}
              style={styles.input}
              left={<TextInput.Icon icon="calendar" />}
            />

            <Text style={styles.helpText}>
              * A alteração será notificada aos administradores
            </Text>

            <View style={styles.buttons}>
              <Button 
                mode="outlined" 
                onPress={onDismiss}
                style={styles.cancelButton}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSave}
                loading={loading}
                disabled={loading}
                style={styles.saveButton}
              >
                Salvar
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 20,
  },
  card: {
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginLeft: 8,
    fontSize: 18,
  },
  divider: {
    marginBottom: 16,
  },
  currentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  currentDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#2196F3',
  },
});

export default PaymentDueDateEditor;
