import { academyFirestoreService } from './academyFirestoreService';
import { userContext, academyUtils, validators } from '../utils/academyValidation';

/**
 * Serviço de auditoria para registrar operações críticas no sistema
 * Garante rastreabilidade completa de ações por academia
 */
class AuditLogService {
  constructor() {
    this.logLevels = {
      INFO: 'info',
      WARNING: 'warning', 
      ERROR: 'error',
      CRITICAL: 'critical'
    };

    this.operationTypes = {
      CREATE: 'create',
      UPDATE: 'update',
      DELETE: 'delete',
      READ: 'read',
      LOGIN: 'login',
      LOGOUT: 'logout',
      PAYMENT: 'payment',
      GRADUATION: 'graduation',
      CLASS_MANAGEMENT: 'class_management',
      STUDENT_MANAGEMENT: 'student_management',
      DATA_EXPORT: 'data_export',
      CONFIGURATION: 'configuration'
    };

    this.sensitiveCollections = [
      'payments',
      'users',
      'evaluations',
      'graduations',
      'personal_data'
    ];
  }

  /**
   * Registrar operação de auditoria
   */
  async logOperation(academiaId, operation, details = {}) {
    try {
      // Validar academiaId
      const validation = validators.isValidAcademiaId(academiaId);
      if (!validation.valid) {
        console.error(`❌ AuditLog: ${validation.error}`);
        return null; // Não bloquear operação principal por erro de auditoria
      }

      // Obter contexto do usuário
      let userInfo = null;
      try {
        userInfo = userContext.getUserInfo();
      } catch (error) {
        console.warn('⚠️ AuditLog: Não foi possível obter informações do usuário', error);
      }

      // Preparar dados do log
      const logData = {
        academiaId,
        operation: operation.type || operation,
        operationType: operation.type || this.operationTypes.INFO,
        level: operation.level || this.logLevels.INFO,
        
        // Informações do usuário
        userId: userInfo?.uid || 'system',
        userEmail: userInfo?.email || 'unknown',
        userRole: userInfo?.role || 'unknown',
        
        // Detalhes da operação
        resource: operation.resource || details.collectionName,
        resourceId: operation.resourceId || details.documentId,
        action: operation.action || 'unknown',
        
        // Metadados
        timestamp: new Date(),
        ip: details.ip || 'client-unknown',
        userAgent: details.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'),
        
        // Dados da operação
        oldData: this._sanitizeData(operation.oldData),
        newData: this._sanitizeData(operation.newData),
        changes: operation.changes || null,
        
        // Contexto adicional
        sessionId: details.sessionId || this._generateSessionId(),
        requestId: details.requestId || this._generateRequestId(),
        
        // Campos personalizados
        customFields: details.customFields || {},
        
        // Status e resultado
        success: operation.success !== false, // Default true
        errorMessage: operation.error?.message || null,
        errorCode: operation.error?.code || null,
        
        // Metadados de sistema
        platform: details.platform || 'web',
        version: details.appVersion || '1.0.0'
      };

      // Adicionar informações específicas para operações sensíveis
      if (this._isSensitiveOperation(operation)) {
        logData.requiresReview = true;
        logData.dataClassification = 'sensitive';
        logData.retentionPeriod = '7_years'; // Para auditoria financeira
      }

      // Salvar log na academia específica
      const logId = await academyFirestoreService.create('audit_logs', logData, academiaId);
      
      // Log local para debugging
      console.log(`📋 Audit Log [${academiaId}]: ${operation.type} - ${operation.action} - ${logId}`);

      // Para operações críticas, também salvar um log de backup
      if (operation.level === this.logLevels.CRITICAL) {
        await this._createBackupLog(logData, logId);
      }

      return logId;

    } catch (error) {
      // NUNCA bloquear operação principal por falha na auditoria
      console.error('❌ Falha no sistema de auditoria:', error);
      
      // Tentar log de emergência local
      this._emergencyLog({
        error: error.message,
        operation,
        academiaId,
        timestamp: new Date().toISOString()
      });

      return null;
    }
  }

  /**
   * Buscar logs de auditoria com filtros
   */
  async getLogs(academiaId, filters = {}) {
    try {
      const validation = validators.isValidAcademiaId(academiaId);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const queryFilters = [];

      // Filtros comuns
      if (filters.userId) {
        queryFilters.push({ field: 'userId', operator: '==', value: filters.userId });
      }

      if (filters.operation) {
        queryFilters.push({ field: 'operation', operator: '==', value: filters.operation });
      }

      if (filters.resource) {
        queryFilters.push({ field: 'resource', operator: '==', value: filters.resource });
      }

      if (filters.startDate) {
        queryFilters.push({ field: 'timestamp', operator: '>=', value: filters.startDate });
      }

      if (filters.endDate) {
        queryFilters.push({ field: 'timestamp', operator: '<=', value: filters.endDate });
      }

      if (filters.level) {
        queryFilters.push({ field: 'level', operator: '==', value: filters.level });
      }

      // Configurar ordenação e limite
      const orderBy = filters.orderBy || { field: 'timestamp', direction: 'desc' };
      const limit = filters.limit || 100;

      const logs = await academyFirestoreService.getDocuments(
        'audit_logs',
        academiaId,
        queryFilters,
        orderBy,
        limit
      );

      return logs;

    } catch (error) {
      console.error('❌ Erro ao buscar logs de auditoria:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório de auditoria
   */
  async generateAuditReport(academiaId, startDate, endDate, options = {}) {
    try {
      const logs = await this.getLogs(academiaId, {
        startDate,
        endDate,
        limit: options.limit || 1000
      });

      const report = {
        academiaId,
        period: { startDate, endDate },
        totalLogs: logs.length,
        summary: {
          byLevel: {},
          byOperation: {},
          byUser: {},
          byResource: {},
          errors: 0,
          warnings: 0
        },
        timeline: this._generateTimeline(logs),
        topUsers: [],
        topOperations: [],
        securityEvents: [],
        recommendations: []
      };

      // Analisar logs
      logs.forEach(log => {
        // Por nível
        report.summary.byLevel[log.level] = (report.summary.byLevel[log.level] || 0) + 1;
        
        // Por operação
        report.summary.byOperation[log.operation] = (report.summary.byOperation[log.operation] || 0) + 1;
        
        // Por usuário
        report.summary.byUser[log.userId] = (report.summary.byUser[log.userId] || 0) + 1;
        
        // Por recurso
        if (log.resource) {
          report.summary.byResource[log.resource] = (report.summary.byResource[log.resource] || 0) + 1;
        }

        // Contadores especiais
        if (log.level === this.logLevels.ERROR) report.summary.errors++;
        if (log.level === this.logLevels.WARNING) report.summary.warnings++;

        // Eventos de segurança
        if (this._isSecurityEvent(log)) {
          report.securityEvents.push(log);
        }
      });

      // Ordenar tops
      report.topUsers = Object.entries(report.summary.byUser)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

      report.topOperations = Object.entries(report.summary.byOperation)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

      // Gerar recomendações
      report.recommendations = this._generateRecommendations(report);

      return report;

    } catch (error) {
      console.error('❌ Erro ao gerar relatório de auditoria:', error);
      throw error;
    }
  }

  /**
   * Logs específicos para operações comuns
   */

  // Log de criação de documento
  async logCreate(academiaId, collectionName, documentId, data, userId = null) {
    return await this.logOperation(academiaId, {
      type: this.operationTypes.CREATE,
      action: 'document_created',
      resource: collectionName,
      resourceId: documentId,
      newData: data,
      level: this._isSensitiveCollection(collectionName) ? this.logLevels.WARNING : this.logLevels.INFO
    });
  }

  // Log de atualização de documento
  async logUpdate(academiaId, collectionName, documentId, oldData, newData, changes) {
    return await this.logOperation(academiaId, {
      type: this.operationTypes.UPDATE,
      action: 'document_updated',
      resource: collectionName,
      resourceId: documentId,
      oldData,
      newData,
      changes,
      level: this._isSensitiveCollection(collectionName) ? this.logLevels.WARNING : this.logLevels.INFO
    });
  }

  // Log de exclusão de documento
  async logDelete(academiaId, collectionName, documentId, data) {
    return await this.logOperation(academiaId, {
      type: this.operationTypes.DELETE,
      action: 'document_deleted',
      resource: collectionName,
      resourceId: documentId,
      oldData: data,
      level: this.logLevels.WARNING
    });
  }

  // Log de pagamento
  async logPayment(academiaId, paymentId, action, amount, studentId, details = {}) {
    return await this.logOperation(academiaId, {
      type: this.operationTypes.PAYMENT,
      action,
      resource: 'payments',
      resourceId: paymentId,
      level: this.logLevels.WARNING,
      customFields: {
        amount,
        studentId,
        ...details
      }
    });
  }

  // Log de graduação
  async logGraduation(academiaId, graduationId, studentId, fromLevel, toLevel) {
    return await this.logOperation(academiaId, {
      type: this.operationTypes.GRADUATION,
      action: 'student_graduated',
      resource: 'graduations',
      resourceId: graduationId,
      level: this.logLevels.INFO,
      customFields: {
        studentId,
        fromLevel,
        toLevel
      }
    });
  }

  // Log de login/logout
  async logAuthentication(academiaId, userId, action, details = {}) {
    return await this.logOperation(academiaId, {
      type: action === 'login' ? this.operationTypes.LOGIN : this.operationTypes.LOGOUT,
      action,
      resource: 'authentication',
      resourceId: userId,
      level: this.logLevels.INFO,
      customFields: details
    });
  }

  /**
   * Métodos utilitários privados
   */

  _sanitizeData(data) {
    if (!data) return null;

    // Remover campos sensíveis do log
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'cvv', 'cardNumber', 'ssn', 'cpf'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }

  _isSensitiveOperation(operation) {
    return this.sensitiveCollections.includes(operation.resource) ||
           operation.level === this.logLevels.CRITICAL ||
           operation.type === this.operationTypes.PAYMENT;
  }

  _isSensitiveCollection(collectionName) {
    return this.sensitiveCollections.includes(collectionName);
  }

  _isSecurityEvent(log) {
    const securityIndicators = [
      log.level === this.logLevels.ERROR,
      log.operation === this.operationTypes.LOGIN && !log.success,
      log.operation === this.operationTypes.DELETE && log.resource === 'users',
      log.customFields?.suspiciousActivity === true
    ];

    return securityIndicators.some(indicator => indicator);
  }

  _generateSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _generateTimeline(logs) {
    // Agrupar logs por hora
    const timeline = {};
    
    logs.forEach(log => {
      const hour = new Date(log.timestamp.toDate()).toISOString().substr(0, 13);
      if (!timeline[hour]) {
        timeline[hour] = { total: 0, errors: 0, warnings: 0 };
      }
      
      timeline[hour].total++;
      if (log.level === this.logLevels.ERROR) timeline[hour].errors++;
      if (log.level === this.logLevels.WARNING) timeline[hour].warnings++;
    });

    return timeline;
  }

  _generateRecommendations(report) {
    const recommendations = [];

    // Muitos erros
    if (report.summary.errors > 10) {
      recommendations.push({
        type: 'high_error_rate',
        message: `Taxa alta de erros detectada: ${report.summary.errors} erros no período`,
        priority: 'high'
      });
    }

    // Eventos de segurança
    if (report.securityEvents.length > 0) {
      recommendations.push({
        type: 'security_events',
        message: `${report.securityEvents.length} eventos de segurança detectados`,
        priority: 'critical'
      });
    }

    // Usuários muito ativos (possível automação)
    const topUser = report.topUsers[0];
    if (topUser && topUser[1] > 100) {
      recommendations.push({
        type: 'high_activity_user',
        message: `Usuário ${topUser[0]} com atividade alta: ${topUser[1]} operações`,
        priority: 'medium'
      });
    }

    return recommendations;
  }

  async _createBackupLog(logData, logId) {
    try {
      // Para logs críticos, criar backup em uma coleção especial
      await academyFirestoreService.create('critical_audit_backup', {
        originalLogId: logId,
        backupTimestamp: new Date(),
        ...logData
      }, logData.academiaId);
    } catch (error) {
      console.error('❌ Falha ao criar backup de log crítico:', error);
    }
  }

  _emergencyLog(data) {
    try {
      // Log local de emergência quando Firestore falha
      if (typeof localStorage !== 'undefined') {
        const emergencyLogs = JSON.parse(localStorage.getItem('emergency_audit_logs') || '[]');
        emergencyLogs.push(data);
        
        // Manter apenas os últimos 100 logs de emergência
        if (emergencyLogs.length > 100) {
          emergencyLogs.splice(0, emergencyLogs.length - 100);
        }
        
        localStorage.setItem('emergency_audit_logs', JSON.stringify(emergencyLogs));
      }
      
      console.warn('⚠️ Log de emergência salvo localmente:', data);
    } catch (error) {
      console.error('❌ Falha total no sistema de auditoria:', error);
    }
  }

  /**
   * Limpar logs antigos (para ser executado periodicamente)
   */
  async cleanupOldLogs(academiaId, retentionDays = 365) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const oldLogs = await academyFirestoreService.getDocuments(
        'audit_logs',
        academiaId,
        [
          { field: 'timestamp', operator: '<', value: cutoffDate },
          { field: 'requiresReview', operator: '!=', value: true } // Não deletar logs que requerem revisão
        ]
      );

      let deletedCount = 0;
      for (const log of oldLogs) {
        await academyFirestoreService.delete('audit_logs', log.id, academiaId);
        deletedCount++;
      }

      console.log(`🧹 ${deletedCount} logs antigos removidos da academia ${academiaId}`);
      return deletedCount;

    } catch (error) {
      console.error('❌ Erro na limpeza de logs antigos:', error);
      throw error;
    }
  }
}

export default new AuditLogService();