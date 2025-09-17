import { academyFirestoreService } from './academyFirestoreService';
import { academyUtils, validators } from '../utils/academyValidation';
import notificationService from './notificationService';

class AcademyPaymentService {
  constructor() {
    this.paymentProviders = {
      PIX: 'pix',
      CREDIT_CARD: 'credit_card', 
      DEBIT_CARD: 'debit_card',
      BANK_SLIP: 'bank_slip',
      CASH: 'cash'
    };

    this.paymentStatus = {
      PENDING: 'pending',
      PAID: 'paid',
      OVERDUE: 'overdue',
      CANCELLED: 'cancelled',
      PROCESSING: 'processing'
    };
  }

  // Validar academiaId antes de operações
  _validateAcademiaId(academiaId, operation) {
    const validation = validators.isValidAcademiaId(academiaId);
    if (!validation.valid) {
      throw new Error(`${operation}: ${validation.error}`);
    }
    return academiaId;
  }

  // Criar cobrança PIX
  async createPixPayment(academiaId, studentId, amount, description, dueDate) {
    try {
      this._validateAcademiaId(academiaId, 'Criar pagamento PIX');

      const paymentData = {
        studentId,
        amount,
        description,
        dueDate: new Date(dueDate),
        method: this.paymentProviders.PIX,
        status: this.paymentStatus.PENDING,
        pixData: {
          qrCode: this.generatePixQRCode(amount, description),
          pixKey: 'academia@exemplo.com', // Chave PIX da academia
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
        }
      };

      const paymentId = await academyFirestoreService.create('payments', paymentData, academiaId);
      
      // Notificar aluno sobre nova cobrança
      await notificationService.notifyPaymentDue(studentId, amount, dueDate);

      // Log de auditoria
      console.log(`💳 Pagamento PIX criado: ${paymentId} para aluno ${studentId} na academia ${academiaId}`);

      return { id: paymentId, ...paymentData };
    } catch (error) {
      console.error('❌ Erro ao criar pagamento PIX:', error);
      throw error;
    }
  }

  // Gerar QR Code PIX (simulado)
  generatePixQRCode(amount, description) {
    // Em produção, usar API do banco para gerar QR Code real
    const pixString = `00020126580014BR.GOV.BCB.PIX0136academia@exemplo.com0208${description}5204000053039865802BR5925ACADEMIA EXEMPLO6009SAO PAULO62070503***6304`;
    return `data:image/png;base64,${Buffer.from(pixString).toString('base64')}`;
  }

  // Processar pagamento com cartão (integração simulada)
  async processCardPayment(academiaId, paymentData, cardData) {
    try {
      this._validateAcademiaId(academiaId, 'Processar pagamento com cartão');

      // Simular processamento com gateway de pagamento
      const paymentResult = await this.simulateCardProcessing(paymentData, cardData);

      if (paymentResult.success) {
        await this.confirmPayment(academiaId, paymentData.id, {
          method: paymentData.method,
          transactionId: paymentResult.transactionId,
          authorizationCode: paymentResult.authorizationCode,
          paidAt: new Date()
        });

        return {
          success: true,
          transactionId: paymentResult.transactionId,
          message: 'Pagamento processado com sucesso'
        };
      } else {
        throw new Error(paymentResult.error);
      }
    } catch (error) {
      console.error('❌ Erro no processamento do cartão:', error);
      throw error;
    }
  }

  // Simular processamento de cartão
  async simulateCardProcessing(paymentData, cardData) {
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simular validações básicas
    if (!cardData.number || cardData.number.length < 16) {
      return { success: false, error: 'Número do cartão inválido' };
    }

    if (!cardData.cvv || cardData.cvv.length < 3) {
      return { success: false, error: 'CVV inválido' };
    }

    if (!cardData.expiryDate || !this.isValidExpiryDate(cardData.expiryDate)) {
      return { success: false, error: 'Data de validade inválida' };
    }

    // Simular aprovação (90% de chance)
    const isApproved = Math.random() > 0.1;

    if (isApproved) {
      return {
        success: true,
        transactionId: `TXN_${Date.now()}`,
        authorizationCode: `AUTH_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };
    } else {
      return { success: false, error: 'Pagamento negado pelo banco' };
    }
  }

  // Validar data de validade do cartão
  isValidExpiryDate(expiryDate) {
    const [month, year] = expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    return expiry > new Date();
  }

  // Confirmar pagamento
  async confirmPayment(academiaId, paymentId, confirmationData) {
    try {
      this._validateAcademiaId(academiaId, 'Confirmar pagamento');

      const updateData = {
        status: this.paymentStatus.PAID,
        paidDate: confirmationData.paidAt || new Date(),
        method: confirmationData.method,
        transactionId: confirmationData.transactionId,
        authorizationCode: confirmationData.authorizationCode
      };

      await academyFirestoreService.update('payments', paymentId, updateData, academiaId);

      // Buscar dados do pagamento para notificação
      const payment = await academyFirestoreService.getById('payments', paymentId, academiaId);
      
      // Notificar confirmação de pagamento
      await notificationService.sendLocalNotification(
        'Pagamento Confirmado! ✅',
        `Seu pagamento de R$ ${payment.amount.toFixed(2)} foi processado com sucesso.`,
        {
          type: 'payment',
          paymentId,
          screen: 'Pagamentos'
        }
      );

      // Log de auditoria
      console.log(`✅ Pagamento confirmado: ${paymentId} na academia ${academiaId}`);

      return true;
    } catch (error) {
      console.error('❌ Erro ao confirmar pagamento:', error);
      throw error;
    }
  }

  // Cancelar pagamento
  async cancelPayment(academiaId, paymentId, reason) {
    try {
      this._validateAcademiaId(academiaId, 'Cancelar pagamento');

      await academyFirestoreService.update('payments', paymentId, {
        status: this.paymentStatus.CANCELLED,
        cancellationReason: reason,
        cancelledAt: new Date()
      }, academiaId);

      // Log de auditoria
      console.log(`❌ Pagamento cancelado: ${paymentId} na academia ${academiaId} - Motivo: ${reason}`);

      return true;
    } catch (error) {
      console.error('❌ Erro ao cancelar pagamento:', error);
      throw error;
    }
  }

  // Listar pagamentos do aluno
  async getStudentPayments(academiaId, studentId, filters = {}) {
    try {
      this._validateAcademiaId(academiaId, 'Buscar pagamentos do aluno');

      const queryFilters = [
        { field: 'studentId', operator: '==', value: studentId }
      ];

      if (filters.status) {
        queryFilters.push({ field: 'status', operator: '==', value: filters.status });
      }

      if (filters.startDate) {
        queryFilters.push({ field: 'dueDate', operator: '>=', value: filters.startDate });
      }

      if (filters.endDate) {
        queryFilters.push({ field: 'dueDate', operator: '<=', value: filters.endDate });
      }

      const payments = await academyFirestoreService.getDocuments(
        'payments',
        academiaId,
        queryFilters,
        { field: 'dueDate', direction: 'desc' }
      );
      
      return payments;
    } catch (error) {
      console.error('❌ Erro ao buscar pagamentos do aluno:', error);
      throw error;
    }
  }

  // Verificar pagamentos vencidos
  async checkOverduePayments(academiaId) {
    try {
      this._validateAcademiaId(academiaId, 'Verificar pagamentos vencidos');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overduePayments = await academyFirestoreService.getDocuments(
        'payments',
        academiaId,
        [
          { field: 'status', operator: '==', value: this.paymentStatus.PENDING },
          { field: 'dueDate', operator: '<', value: today }
        ]
      );

      // Atualizar status para vencido
      const updatePromises = overduePayments.map(payment => 
        academyFirestoreService.update('payments', payment.id, {
          status: this.paymentStatus.OVERDUE
        }, academiaId)
      );

      await Promise.all(updatePromises);

      // Notificar alunos sobre pagamentos vencidos
      for (const payment of overduePayments) {
        await notificationService.sendLocalNotification(
          'Pagamento Vencido! ⚠️',
          `Sua mensalidade de R$ ${payment.amount.toFixed(2)} está vencida.`,
          {
            type: 'payment',
            paymentId: payment.id,
            screen: 'Pagamentos'
          }
        );
      }

      console.log(`⚠️ ${overduePayments.length} pagamentos vencidos atualizados na academia ${academiaId}`);
      return overduePayments.length;
    } catch (error) {
      console.error('❌ Erro ao verificar pagamentos vencidos:', error);
      throw error;
    }
  }

  // Gerar relatório de pagamentos
  async generatePaymentReport(academiaId, startDate, endDate) {
    try {
      this._validateAcademiaId(academiaId, 'Gerar relatório de pagamentos');

      const payments = await academyFirestoreService.getDocuments(
        'payments',
        academiaId,
        [
          { field: 'dueDate', operator: '>=', value: startDate },
          { field: 'dueDate', operator: '<=', value: endDate }
        ]
      );

      const report = {
        academiaId,
        period: { startDate, endDate },
        totalPayments: payments.length,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        overdueAmount: 0,
        byMethod: {},
        byStatus: {
          paid: 0,
          pending: 0,
          overdue: 0,
          cancelled: 0
        }
      };

      payments.forEach(payment => {
        report.totalAmount += payment.amount;
        
        // Por status
        report.byStatus[payment.status]++;
        
        switch (payment.status) {
          case this.paymentStatus.PAID:
            report.paidAmount += payment.amount;
            break;
          case this.paymentStatus.PENDING:
            report.pendingAmount += payment.amount;
            break;
          case this.paymentStatus.OVERDUE:
            report.overdueAmount += payment.amount;
            break;
        }

        // Por método
        const method = payment.method || 'unknown';
        if (!report.byMethod[method]) {
          report.byMethod[method] = { count: 0, amount: 0 };
        }
        report.byMethod[method].count++;
        report.byMethod[method].amount += payment.amount;
      });

      return report;
    } catch (error) {
      console.error('❌ Erro ao gerar relatório de pagamentos:', error);
      throw error;
    }
  }

  // Criar mensalidade recorrente
  async createRecurringPayment(academiaId, studentId, amount, description, startDate, frequency = 'monthly') {
    try {
      this._validateAcademiaId(academiaId, 'Criar pagamento recorrente');

      const payments = [];
      const currentDate = new Date(startDate);
      
      // Criar 12 mensalidades
      for (let i = 0; i < 12; i++) {
        const dueDate = new Date(currentDate);
        
        if (frequency === 'monthly') {
          dueDate.setMonth(currentDate.getMonth() + i);
        }

        const paymentData = {
          studentId,
          amount,
          description: `${description} - ${dueDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
          dueDate,
          method: null, // Será definido quando o aluno escolher
          status: this.paymentStatus.PENDING,
          isRecurring: true,
          recurringId: `REC_${Date.now()}_${studentId}`
        };

        const paymentId = await academyFirestoreService.create('payments', paymentData, academiaId);
        payments.push({ id: paymentId, ...paymentData });
      }

      console.log(`📅 ${payments.length} mensalidades recorrentes criadas para aluno ${studentId} na academia ${academiaId}`);
      return payments;
    } catch (error) {
      console.error('❌ Erro ao criar pagamentos recorrentes:', error);
      throw error;
    }
  }

  // Calcular estatísticas de pagamento
  async getPaymentStats(academiaId, studentId) {
    try {
      this._validateAcademiaId(academiaId, 'Calcular estatísticas de pagamento');

      const payments = await this.getStudentPayments(academiaId, studentId);
      
      const stats = {
        academiaId,
        studentId,
        total: payments.length,
        paid: payments.filter(p => p.status === this.paymentStatus.PAID).length,
        pending: payments.filter(p => p.status === this.paymentStatus.PENDING).length,
        overdue: payments.filter(p => p.status === this.paymentStatus.OVERDUE).length,
        totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
        paidAmount: payments.filter(p => p.status === this.paymentStatus.PAID).reduce((sum, p) => sum + p.amount, 0),
        pendingAmount: payments.filter(p => p.status === this.paymentStatus.PENDING).reduce((sum, p) => sum + p.amount, 0),
        overdueAmount: payments.filter(p => p.status === this.paymentStatus.OVERDUE).reduce((sum, p) => sum + p.amount, 0),
        paymentRate: 0
      };

      stats.paymentRate = stats.total > 0 ? (stats.paid / stats.total) * 100 : 0;

      return stats;
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas de pagamento:', error);
      throw error;
    }
  }

  // Método para usar o academiaId do contexto do usuário atual
  async withCurrentAcademia(operation) {
    try {
      const academiaId = academyUtils.getCurrentAcademiaId();
      return await operation(academiaId);
    } catch (error) {
      console.error('❌ Erro ao executar operação com academia atual:', error);
      throw error;
    }
  }
}

export default new AcademyPaymentService();