import { useState, useEffect } from 'react';
import { auth } from '../services/firebase';

/**
 * Middleware e utilitários para validação de academias
 * Garante que todas as operações são realizadas no contexto da academia correta
 */

/**
 * Erros específicos para operações de academia
 */
export class AcademyValidationError extends Error {
  constructor(message, code = 'ACADEMY_VALIDATION_ERROR') {
    super(message);
    this.name = 'AcademyValidationError';
    this.code = code;
  }
}

export class AcademyAccessDeniedError extends AcademyValidationError {
  constructor(message = 'Acesso negado à academia') {
    super(message, 'ACADEMY_ACCESS_DENIED');
  }
}

export class AcademyNotFoundError extends AcademyValidationError {
  constructor(message = 'Academia não encontrada') {
    super(message, 'ACADEMY_NOT_FOUND');
  }
}

/**
 * Constantes de validação
 */
export const ACADEMY_VALIDATION_RULES = {
  ACADEMIA_ID_MIN_LENGTH: 10,
  ACADEMIA_ID_MAX_LENGTH: 50,
  ACADEMIA_ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
  REQUIRED_USER_CLAIMS: ['academiaId', 'role'],
  VALID_USER_ROLES: ['student', 'instructor', 'admin'],
  SESSION_TIMEOUT_MINUTES: 60
};

/**
 * Validadores básicos
 */
export const validators = {
  /**
   * Validar formato do academiaId
   */
  isValidAcademiaId: (academiaId) => {
    if (!academiaId || typeof academiaId !== 'string') {
      return { valid: false, error: 'academiaId deve ser uma string' };
    }
    
    if (academiaId.length < ACADEMY_VALIDATION_RULES.ACADEMIA_ID_MIN_LENGTH || 
        academiaId.length > ACADEMY_VALIDATION_RULES.ACADEMIA_ID_MAX_LENGTH) {
      return { 
        valid: false, 
        error: `academiaId deve ter entre ${ACADEMY_VALIDATION_RULES.ACADEMIA_ID_MIN_LENGTH} e ${ACADEMY_VALIDATION_RULES.ACADEMIA_ID_MAX_LENGTH} caracteres` 
      };
    }
    
    if (!ACADEMY_VALIDATION_RULES.ACADEMIA_ID_PATTERN.test(academiaId)) {
      return { 
        valid: false, 
        error: 'academiaId deve conter apenas letras, números, _ e -' 
      };
    }
    
    return { valid: true };
  },

  /**
   * Validar role do usuário
   */
  isValidUserRole: (role) => {
    if (!role || !ACADEMY_VALIDATION_RULES.VALID_USER_ROLES.includes(role)) {
      return { 
        valid: false, 
        error: `Role deve ser um dos seguintes: ${ACADEMY_VALIDATION_RULES.VALID_USER_ROLES.join(', ')}` 
      };
    }
    return { valid: true };
  },

  /**
   * Validar se o usuário tem permissão para a academia
   */
  hasAcademyAccess: (userAcademiaId, requiredAcademiaId) => {
    if (userAcademiaId !== requiredAcademiaId) {
      return { 
        valid: false, 
        error: `Usuário pertence à academia ${userAcademiaId}, mas tentou acessar academia ${requiredAcademiaId}` 
      };
    }
    return { valid: true };
  },

  /**
   * Validar se o usuário tem role suficiente para a operação
   */
  hasRequiredRole: (userRole, requiredRoles) => {
    const roleHierarchy = { 'student': 1, 'instructor': 2, 'admin': 3 };
    const userLevel = roleHierarchy[userRole] || 0;
    const maxRequiredLevel = Math.max(...requiredRoles.map(role => roleHierarchy[role] || 0));
    
    if (userLevel < maxRequiredLevel) {
      return { 
        valid: false, 
        error: `Operação requer role ${requiredRoles.join(' ou ')}, mas usuário tem role ${userRole}` 
      };
    }
    return { valid: true };
  }
};

/**
 * Utilitários para extrair informações do contexto do usuário
 */
export const userContext = {
  /**
   * Obter ID da academia do usuário autenticado
   */
  getAcademiaId: () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new AcademyValidationError('Usuário não autenticado');
      }

      // Tentar obter do token claims (preferido)
      if (user.customClaims?.academiaId) {
        return user.customClaims.academiaId;
      }

      // Fallback: tentar obter do contexto de aplicação
      const academiaId = user.academiaId || localStorage.getItem('user_academiaId');
      if (!academiaId) {
        throw new AcademyNotFoundError('usuário não está associado a nenhuma academia');
      }

      return academiaId;
    } catch (error) {
      console.error('❌ Erro ao obter academiaId do usuário:', error);
      throw error;
    }
  },

  /**
   * Obter role do usuário autenticado
   */
  getUserRole: () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new AcademyValidationError('Usuário não autenticado');
      }

      // Tentar obter do token claims (preferido)
      if (user.customClaims?.role) {
        return user.customClaims.role;
      }

      // Fallback: tentar obter do contexto de aplicação
      const role = user.userRole || localStorage.getItem('user_role');
      if (!role) {
        throw new AcademyValidationError('Role do usuário não definido');
      }

      return role;
    } catch (error) {
      console.error('❌ Erro ao obter role do usuário:', error);
      throw error;
    }
  },

  /**
   * Obter informações completas do usuário
   */
  getUserInfo: () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new AcademyValidationError('Usuário não autenticado');
      }

      return {
        uid: user.uid,
        email: user.email,
        academiaId: userContext.getAcademiaId(),
        role: userContext.getUserRole(),
        displayName: user.displayName,
        emailVerified: user.emailVerified
      };
    } catch (error) {
      console.error('❌ Erro ao obter informações do usuário:', error);
      throw error;
    }
  },

  /**
   * Verificar se sessão é válida
   */
  isSessionValid: () => {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      // Verificar se o token não expirou
      const lastSignIn = user.metadata?.lastSignInTime;
      if (lastSignIn) {
        const lastSignInTime = new Date(lastSignIn);
        const now = new Date();
        const diffMinutes = (now - lastSignInTime) / (1000 * 60);
        
        if (diffMinutes > ACADEMY_VALIDATION_RULES.SESSION_TIMEOUT_MINUTES) {
          console.warn('⚠️ Sessão expirada');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar validade da sessão:', error);
      return false;
    }
  }
};

/**
 * Middleware de validação para operações de academia
 */
export const academyMiddleware = {
  /**
   * Validar acesso à academia
   */
  validateAcademyAccess: (requiredAcademiaId, options = {}) => {
    const { 
      allowSuperAdmin = false,
      requiredRoles = [],
      throwOnError = true 
    } = options;

    try {
      // Verificar se usuário está autenticado
      if (!userContext.isSessionValid()) {
        throw new AcademyValidationError('Sessão inválida ou expirada');
      }

      const userInfo = userContext.getUserInfo();

      // Validar academiaId
      const academiaValidation = validators.isValidAcademiaId(requiredAcademiaId);
      if (!academiaValidation.valid) {
        throw new AcademyValidationError(academiaValidation.error);
      }

      // Super admin bypass (se habilitado)
      if (allowSuperAdmin && userInfo.role === 'superadmin') {
        return { valid: true, userInfo };
      }

      // Validar acesso à academia
      const accessValidation = validators.hasAcademyAccess(userInfo.academiaId, requiredAcademiaId);
      if (!accessValidation.valid) {
        throw new AcademyAccessDeniedError(accessValidation.error);
      }

      // Validar role se especificado
      if (requiredRoles.length > 0) {
        const roleValidation = validators.hasRequiredRole(userInfo.role, requiredRoles);
        if (!roleValidation.valid) {
          throw new AcademyAccessDeniedError(roleValidation.error);
        }
      }

      return { valid: true, userInfo };

    } catch (error) {
      if (throwOnError) {
        throw error;
      }
      return { valid: false, error: error.message };
    }
  },

  /**
   * Decorator para métodos que requerem validação de academia
   */
  requireAcademyAccess: (requiredRoles = []) => {
    return function(target, propertyKey, descriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = async function(...args) {
        // Assumir que o primeiro argumento é sempre academiaId
        const academiaId = args[0];
        
        try {
          // Validar acesso
          const validation = academyMiddleware.validateAcademyAccess(academiaId, {
            requiredRoles,
            throwOnError: true
          });

          // Log da operação para auditoria
          console.log(`🔒 Acesso validado para ${propertyKey}: usuário ${validation.userInfo.uid} (${validation.userInfo.role}) na academia ${academiaId}`);

          // Executar método original
          return await originalMethod.apply(this, args);

        } catch (error) {
          console.error(`❌ Falha na validação de acesso para ${propertyKey}:`, error);
          throw error;
        }
      };

      return descriptor;
    };
  }
};

/**
 * Utilitários para operações de academia
 */
export const academyUtils = {
  /**
   * Extrair academiaId do contexto do usuário (para uso quando não é passado explicitamente)
   */
  getCurrentAcademiaId: () => {
    try {
      return userContext.getAcademiaId();
    } catch (error) {
      throw new AcademyValidationError(`Não foi possível determinar academia atual: ${error.message}`);
    }
  },

  /**
   * Validar e normalizar academiaId
   */
  normalizeAcademiaId: (academiaId) => {
    if (!academiaId) {
      academiaId = academyUtils.getCurrentAcademiaId();
    }

    const validation = validators.isValidAcademiaId(academiaId);
    if (!validation.valid) {
      throw new AcademyValidationError(validation.error);
    }

    return academiaId.trim();
  },

  /**
   * Gerar log de auditoria padronizado
   */
  createAuditLog: (operation, details = {}) => {
    try {
      const userInfo = userContext.getUserInfo();
      
      return {
        timestamp: new Date().toISOString(),
        userId: userInfo.uid,
        userRole: userInfo.role,
        academiaId: userInfo.academiaId,
        operation,
        details,
        userAgent: navigator?.userAgent,
        ip: 'client-side' // Será preenchido no backend se necessário
      };
    } catch (error) {
      console.error('❌ Erro ao criar log de auditoria:', error);
      return {
        timestamp: new Date().toISOString(),
        operation,
        details,
        error: error.message
      };
    }
  },

  /**
   * Verificar se operação é permitida baseada no contexto
   */
  isOperationAllowed: (operation, targetAcademiaId = null, requiredRoles = []) => {
    try {
      const academiaId = targetAcademiaId || academyUtils.getCurrentAcademiaId();
      
      const validation = academyMiddleware.validateAcademyAccess(academiaId, {
        requiredRoles,
        throwOnError: false
      });

      return {
        allowed: validation.valid,
        reason: validation.error || null,
        userInfo: validation.userInfo || null
      };
    } catch (error) {
      return {
        allowed: false,
        reason: error.message,
        userInfo: null
      };
    }
  },

  /**
   * Wrapper para operações que requerem validação
   */
  withAcademyValidation: async (academiaId, requiredRoles = [], operation) => {
    const normalizedAcademiaId = academyUtils.normalizeAcademiaId(academiaId);
    
    // Validar acesso
    const validation = academyMiddleware.validateAcademyAccess(normalizedAcademiaId, {
      requiredRoles,
      throwOnError: true
    });

    // Executar operação com contexto validado
    return await operation(normalizedAcademiaId, validation.userInfo);
  }
};

/**
 * Hook para React components que precisam de validação de academia
 */
export const useAcademyValidation = (requiredRoles = []) => {
  const [validationState, setValidationState] = useState({
    isValid: false,
    isLoading: true,
    error: null,
    userInfo: null,
    academiaId: null
  });

  useEffect(() => {
    const validateAccess = async () => {
      try {
        setValidationState(prev => ({ ...prev, isLoading: true }));

        const academiaId = academyUtils.getCurrentAcademiaId();
        const validation = academyMiddleware.validateAcademyAccess(academiaId, {
          requiredRoles,
          throwOnError: true
        });

        setValidationState({
          isValid: true,
          isLoading: false,
          error: null,
          userInfo: validation.userInfo,
          academiaId
        });

      } catch (error) {
        setValidationState({
          isValid: false,
          isLoading: false,
          error: error.message,
          userInfo: null,
          academiaId: null
        });
      }
    };

    // Executar validação inicial
    validateAccess();

    // Configurar listener para mudanças de autenticação
    const unsubscribe = auth.onAuthStateChanged(() => {
      validateAccess();
    });

    return unsubscribe;
  }, [requiredRoles]);

  return validationState;
};

export default {
  validators,
  userContext,
  academyMiddleware,
  academyUtils,
  useAcademyValidation,
  AcademyValidationError,
  AcademyAccessDeniedError,
  AcademyNotFoundError
};