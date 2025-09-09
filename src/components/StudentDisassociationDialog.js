import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { 
  Dialog, 
  Portal, 
  Button, 
  Text, 
  TextInput,
  Divider,
  Chip
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { firestoreService } from '../services/firestoreService';

const StudentDisassociationDialog = ({ visible, onDismiss, student, onSuccess }) => {
  const { user, userProfile, academia } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Verificar se o usuário tem permissão para desassociar alunos
  const canDisassociateStudent = () => {
    return userProfile?.role === 'admin' || userProfile?.role === 'instructor';
  };

  const handleDisassociation = async () => {
    if (!canDisassociateStudent()) {
      showError('Você não tem permissão para desassociar alunos');
      return;
    }

    if (!reason.trim()) {
      showError('Por favor, informe o motivo da desassociação');
      return;
    }

    Alert.alert(
      'Confirmar Desassociação',
      `Tem certeza que deseja desassociar ${student?.name} da academia?\n\nEsta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', style: 'destructive', onPress: performDisassociation }
      ]
    );
  };

  const performDisassociation = async () => {
    try {
      setLoading(true);

      // Atualizar status do usuário para inativo
      await firestoreService.update(`academias/${academia.id}/usuarios`, student.id, {
        status: 'inactive',
        disassociatedAt: new Date(),
        disassociatedBy: user.uid,
        disassociationReason: reason,
        updatedAt: new Date()
      });

      // Cancelar pagamentos pendentes
      const pendingPayments = await firestoreService.getDocuments(
        `academias/${academia.id}/payments`,
        [
          { field: 'userId', operator: '==', value: student.id },
          { field: 'status', operator: '==', value: 'pending' }
        ]
      );

      const cancelPaymentPromises = pendingPayments.map(payment =>
        firestoreService.update(`academias/${academia.id}/payments`, payment.id, {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledBy: user.uid,
          cancellationReason: 'Aluno desassociado da academia'
        })
      );

      await Promise.all(cancelPaymentPromises);

      // Registrar log da desassociação
      await firestoreService.create(`academias/${academia.id}/logs`, {
        type: 'student_disassociation',
        userId: student.id,
        performedBy: user.uid,
        performedByName: userProfile.name,
        studentName: student.name,
        reason: reason,
        timestamp: new Date(),
        details: {
          cancelledPayments: pendingPayments.length,
          academiaId: academia.id,
          academiaName: academia.name
        }
      });

      // Notificar administradores sobre a desassociação
      await notifyAdminsAboutDisassociation(student, reason);

      showSuccess(`${student.name} foi desassociado da academia`);
      onSuccess();
      onDismiss();
      setReason('');

    } catch (error) {
      console.error('Erro ao desassociar aluno:', error);
      showError('Erro ao desassociar aluno da academia');
    } finally {
      setLoading(false);
    }
  };

  const notifyAdminsAboutDisassociation = async (student, reason) => {
    try {
      // Buscar todos os administradores
      const admins = await firestoreService.getDocuments(
        `academias/${academia.id}/usuarios`,
        [{ field: 'role', operator: '==', value: 'admin' }]
      );

      // Criar notificação para cada administrador (exceto quem executou a ação)
      const notificationPromises = admins
        .filter(admin => admin.id !== user.uid)
        .map(admin => 
          firestoreService.create(`academias/${academia.id}/notifications`, {
            userId: admin.id,
            type: 'student_disassociation',
            title: 'Aluno Desassociado',
            message: `${userProfile.name} desassociou ${student.name} da academia`,
            data: {
              studentId: student.id,
              studentName: student.name,
              performedBy: user.uid,
              performedByName: userProfile.name,
              reason: reason,
              academiaId: academia.id
            },
            read: false,
            priority: 'high'
          })
        );

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Erro ao notificar administradores:', error);
    }
  };

  if (!canDisassociateStudent()) {
    return null;
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>
          <View style={styles.titleContainer}>
            <Ionicons name="person-remove-outline" size={24} color="#F44336" />
            <Text style={styles.titleText}>Desassociar Aluno</Text>
          </View>
        </Dialog.Title>
        
        <Dialog.Content>
          <View style={styles.studentInfo}>
            <Text style={styles.label}>Aluno:</Text>
            <Chip mode="outlined" style={styles.studentChip}>
              {student?.name}
            </Chip>
          </View>

          <View style={styles.studentInfo}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.studentEmail}>{student?.email}</Text>
          </View>

          <Divider style={styles.divider} />

          <TextInput
            label="Motivo da desassociação *"
            value={reason}
            onChangeText={setReason}
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="Informe o motivo da desassociação (ex: inadimplência, solicitação do aluno, etc.)"
            style={styles.reasonInput}
          />

          <Text style={styles.warningText}>
            ⚠️ Esta ação irá:
          </Text>
          <Text style={styles.warningItem}>• Inativar o aluno na academia</Text>
          <Text style={styles.warningItem}>• Cancelar pagamentos pendentes</Text>
          <Text style={styles.warningItem}>• Registrar log da operação</Text>
          <Text style={styles.warningItem}>• Notificar administradores</Text>
        </Dialog.Content>

        <Dialog.Actions>
          <Button 
            onPress={onDismiss}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            mode="contained"
            onPress={handleDisassociation}
            loading={loading}
            disabled={loading || !reason.trim()}
            buttonColor="#F44336"
          >
            Desassociar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 60,
  },
  studentChip: {
    borderColor: '#2196F3',
  },
  studentEmail: {
    fontSize: 16,
    color: '#666',
  },
  divider: {
    marginVertical: 16,
  },
  reasonInput: {
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
  },
  warningItem: {
    fontSize: 14,
    color: '#666',
    marginLeft: 16,
    marginBottom: 4,
  },
});

export default StudentDisassociationDialog;
