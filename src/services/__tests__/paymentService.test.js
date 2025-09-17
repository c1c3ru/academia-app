// Mock the services before import
jest.mock('../firestoreService');
jest.mock('../notificationService');

import paymentService from '../paymentService';
import { firestoreService } from '../firestoreService';
import notificationService from '../notificationService';

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset all mocks to their default implementations
    firestoreService.addDocument.mockResolvedValue('mock-id');
    firestoreService.updateDocument.mockResolvedValue();
    firestoreService.getDocument.mockResolvedValue({});
    firestoreService.getDocumentsWithFilters.mockResolvedValue([]);
    firestoreService.deleteDocument.mockResolvedValue();
    
    notificationService.scheduleClassReminders.mockResolvedValue();
    notificationService.sendLocalNotification.mockResolvedValue();
    notificationService.requestPermissions.mockResolvedValue();
    notificationService.notifyPaymentDue.mockResolvedValue();
  });

  describe('createPixPayment', () => {
    it('should create PIX payment successfully', async () => {
      firestoreService.addDocument.mockResolvedValue('payment-id-123');
      notificationService.notifyPaymentDue.mockResolvedValue();

      const result = await paymentService.createPixPayment(
        'student-123',
        150.00,
        'Mensalidade Janeiro',
        new Date('2024-02-01')
      );

      expect(result.id).toBe('payment-id-123');
      expect(result.amount).toBe(150.00);
      expect(result.method).toBe('pix');
      expect(result.status).toBe('pending');
      expect(result.pixData.qrCode).toBeDefined();
      expect(notificationService.notifyPaymentDue).toHaveBeenCalledWith(
        'student-123',
        150.00,
        new Date('2024-02-01')
      );
    });

    it('should throw error when creation fails', async () => {
      firestoreService.addDocument.mockRejectedValue(new Error('Database error'));

      await expect(
        paymentService.createPixPayment('student-123', 150.00, 'Test', new Date())
      ).rejects.toThrow('Database error');
    });
  });

  describe('processCardPayment', () => {
    const mockPaymentData = {
      id: 'payment-123',
      amount: 150.00,
      method: 'credit_card'
    };

    const mockCardData = {
      number: '1234567890123456',
      cvv: '123',
      expiryDate: '12/25',
      holderName: 'Test User'
    };

    it('should process card payment successfully', async () => {
      // Mock Math.random to ensure approval (return value < 0.1 means denied, > 0.1 means approved)
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      jest.spyOn(paymentService, 'confirmPayment').mockResolvedValue(true);

      const result = await paymentService.processCardPayment(mockPaymentData, mockCardData);

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(result.message).toBe('Pagamento processado com sucesso');
      
      // Restore Math.random
      Math.random.mockRestore();
    });

    it('should reject payment with invalid card number', async () => {
      const invalidCardData = { ...mockCardData, number: '123' };

      await expect(
        paymentService.processCardPayment(mockPaymentData, invalidCardData)
      ).rejects.toThrow('Número do cartão inválido');
    });

    it('should reject payment with invalid CVV', async () => {
      const invalidCardData = { ...mockCardData, cvv: '12' };

      await expect(
        paymentService.processCardPayment(mockPaymentData, invalidCardData)
      ).rejects.toThrow('CVV inválido');
    });

    it('should reject payment with expired card', async () => {
      const invalidCardData = { ...mockCardData, expiryDate: '12/20' };

      await expect(
        paymentService.processCardPayment(mockPaymentData, invalidCardData)
      ).rejects.toThrow('Data de validade inválida');
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment and send notification', async () => {
      const mockPayment = { id: 'payment-123', amount: 150.00 };
      
      // Configure mocks
      firestoreService.updateDocument = jest.fn().mockResolvedValue();
      firestoreService.getDocument = jest.fn().mockResolvedValue(mockPayment);
      notificationService.sendLocalNotification = jest.fn().mockResolvedValue();

      const paidAt = new Date();
      
      const result = await paymentService.confirmPayment('payment-123', {
        paidAt,
        method: 'credit_card',
        transactionId: 'txn-123',
        authorizationCode: 'AUTH_123'
      });

      expect(result).toBe(true);
      expect(firestoreService.updateDocument).toHaveBeenCalledTimes(1);
      expect(firestoreService.updateDocument).toHaveBeenCalledWith(
        'payments',
        'payment-123',
        expect.objectContaining({
          status: 'paid',
          method: 'credit_card',
          transactionId: 'txn-123',
          authorizationCode: 'AUTH_123',
          paidDate: paidAt,
          updatedAt: expect.any(Date)
        })
      );
      
      expect(firestoreService.getDocument).toHaveBeenCalledTimes(1);
      expect(firestoreService.getDocument).toHaveBeenCalledWith('payments', 'payment-123');
      
      expect(notificationService.sendLocalNotification).toHaveBeenCalledTimes(1);
      expect(notificationService.sendLocalNotification).toHaveBeenCalledWith(
        'Pagamento Confirmado! ✅',
        'Seu pagamento de R$ 150.00 foi processado com sucesso.',
        {
          type: 'payment',
          paymentId: 'payment-123',
          screen: 'Pagamentos'
        }
      );
    });
  });

  describe('getStudentPayments', () => {
    it('should return student payments with filters', async () => {
      const mockPayments = [
        { id: 'payment1', studentId: 'student-123', status: 'paid', dueDate: { toDate: () => new Date('2024-01-01') } },
        { id: 'payment2', studentId: 'student-123', status: 'pending', dueDate: { toDate: () => new Date('2024-02-01') } }
      ];

      firestoreService.getDocumentsWithFilters.mockResolvedValue(mockPayments);

      const result = await paymentService.getStudentPayments('student-123', { status: 'paid' });

      expect(result).toHaveLength(2);
      expect(firestoreService.getDocumentsWithFilters).toHaveBeenCalledWith(
        'payments',
        expect.arrayContaining([
          { field: 'studentId', operator: '==', value: 'student-123' },
          { field: 'status', operator: '==', value: 'paid' }
        ])
      );
    });
  });

  describe('checkOverduePayments', () => {
    it('should update overdue payments and send notifications', async () => {
      const mockOverduePayments = [
        { id: 'payment1', amount: 150, studentId: 'student-123' },
        { id: 'payment2', amount: 200, studentId: 'student-456' }
      ];

      firestoreService.getDocumentsWithFilters.mockResolvedValue(mockOverduePayments);
      firestoreService.updateDocument.mockResolvedValue();
      notificationService.sendLocalNotification.mockResolvedValue();

      const result = await paymentService.checkOverduePayments();

      expect(result).toBe(2);
      expect(firestoreService.updateDocument).toHaveBeenCalledTimes(2);
      expect(notificationService.sendLocalNotification).toHaveBeenCalledTimes(2);
    });
  });

  describe('createRecurringPayment', () => {
    it('should create 12 monthly payments', async () => {
      firestoreService.addDocument
        .mockResolvedValueOnce('payment1')
        .mockResolvedValueOnce('payment2')
        .mockResolvedValue('payment-n');

      const result = await paymentService.createRecurringPayment(
        'student-123',
        150.00,
        'Mensalidade',
        new Date('2024-01-01')
      );

      expect(result).toHaveLength(12);
      expect(firestoreService.addDocument).toHaveBeenCalledTimes(12);
      expect(result[0].isRecurring).toBe(true);
      expect(result[0].recurringId).toContain('student-123');
    });
  });

  describe('getPaymentStats', () => {
    it('should calculate payment statistics correctly', async () => {
      const mockPayments = [
        { status: 'paid', amount: 150 },
        { status: 'paid', amount: 200 },
        { status: 'pending', amount: 150 },
        { status: 'overdue', amount: 100 }
      ];

      jest.spyOn(paymentService, 'getStudentPayments').mockResolvedValue(mockPayments);

      const stats = await paymentService.getPaymentStats('student-123');

      expect(stats.total).toBe(4);
      expect(stats.paid).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.overdue).toBe(1);
      expect(stats.totalAmount).toBe(600);
      expect(stats.paidAmount).toBe(350);
      expect(stats.pendingAmount).toBe(150);
      expect(stats.overdueAmount).toBe(100);
      expect(stats.paymentRate).toBe(50); // 2/4 * 100
    });
  });
});
