import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Academy-isolated Firestore service
 * Ensures all operations are scoped to a specific academy
 */

// Collections que devem ser isoladas por academia
const ACADEMY_ISOLATED_COLLECTIONS = [
  'classes',
  'payments', 
  'checkins',
  'graduations',
  'modalities',
  'plans',
  'announcements',
  'graduation_levels',
  'events',
  'eventRegistrations',
  'evaluations',
  'evaluation_schedules',
  'audit_logs',
  'notifications',
  'injuries'
];

// Collections globais que não precisam de isolamento
const GLOBAL_COLLECTIONS = [
  'users',
  'gyms',
  'invites'
];

/**
 * Validação de academiaId
 */
function validateAcademiaId(academiaId, operation = 'operation') {
  if (!academiaId || typeof academiaId !== 'string') {
    throw new Error(`academiaId é obrigatório para ${operation}`);
  }
}

/**
 * Obter referência de coleção (global ou específica da academia)
 */
function getCollectionRef(collectionName, academiaId = null) {
  if (ACADEMY_ISOLATED_COLLECTIONS.includes(collectionName)) {
    validateAcademiaId(academiaId, `operações em ${collectionName}`);
    return collection(db, 'gyms', academiaId, collectionName);
  }
  
  if (GLOBAL_COLLECTIONS.includes(collectionName)) {
    return collection(db, collectionName);
  }
  
  throw new Error(`Coleção '${collectionName}' não está configurada para uso`);
}

/**
 * Obter referência de documento (global ou específica da academia)
 */
function getDocumentRef(collectionName, docId, academiaId = null) {
  if (ACADEMY_ISOLATED_COLLECTIONS.includes(collectionName)) {
    validateAcademiaId(academiaId, `operações em ${collectionName}`);
    return doc(db, 'gyms', academiaId, collectionName, docId);
  }
  
  if (GLOBAL_COLLECTIONS.includes(collectionName)) {
    return doc(db, collectionName, docId);
  }
  
  throw new Error(`Coleção '${collectionName}' não está configurada para uso`);
}

/**
 * Academy-aware Firestore service
 * Todas as operações são automaticamente direcionadas para a academia correta
 */
export const academyFirestoreService = {
  
  /**
   * Criar documento
   * @param {string} collectionName - Nome da coleção
   * @param {Object} data - Dados do documento
   * @param {string} academiaId - ID da academia (obrigatório para coleções isoladas)
   */
  create: async (collectionName, data, academiaId = null) => {
    try {
      const collectionRef = getCollectionRef(collectionName, academiaId);
      
      const docRef = await addDoc(collectionRef, {
        ...data,
        academiaId: academiaId || data.academiaId, // Garantir que academiaId está no documento
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Documento criado em ${collectionName}${academiaId ? ` (academia: ${academiaId})` : ''}: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error(`❌ Erro ao criar documento em ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Buscar documento por ID
   * @param {string} collectionName - Nome da coleção
   * @param {string} id - ID do documento
   * @param {string} academiaId - ID da academia (obrigatório para coleções isoladas)
   */
  getById: async (collectionName, id, academiaId = null) => {
    try {
      const docRef = getDocumentRef(collectionName, id, academiaId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        
        // Validação adicional de segurança para coleções isoladas
        if (ACADEMY_ISOLATED_COLLECTIONS.includes(collectionName) && data.academiaId !== academiaId) {
          console.warn(`⚠️ Tentativa de acesso cross-academy detectada: documento ${id} pertence à academia ${data.academiaId}, não ${academiaId}`);
          return null;
        }
        
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`❌ Erro ao buscar documento ${id} em ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Buscar todos os documentos de uma coleção
   * @param {string} collectionName - Nome da coleção
   * @param {string} academiaId - ID da academia (obrigatório para coleções isoladas)
   * @param {string} orderByField - Campo para ordenação
   * @param {string} orderDirection - Direção da ordenação
   */
  getAll: async (collectionName, academiaId = null, orderByField = 'createdAt', orderDirection = 'desc') => {
    try {
      const collectionRef = getCollectionRef(collectionName, academiaId);
      const q = query(collectionRef, orderBy(orderByField, orderDirection));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`❌ Erro ao buscar documentos em ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Buscar documentos com filtro
   * @param {string} collectionName - Nome da coleção
   * @param {string} field - Campo do filtro
   * @param {string} operator - Operador do filtro
   * @param {any} value - Valor do filtro
   * @param {string} academiaId - ID da academia (obrigatório para coleções isoladas)
   */
  getWhere: async (collectionName, field, operator, value, academiaId = null) => {
    try {
      const collectionRef = getCollectionRef(collectionName, academiaId);
      const q = query(collectionRef, where(field, operator, value));
      const querySnapshot = await getDocs(q);
      
      // Ordenar em memória por createdAt desc para manter comportamento anterior
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return docs.sort((a, b) => {
        const aTime = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const bTime = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
    } catch (error) {
      console.error(`❌ Erro ao buscar documentos filtrados em ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Buscar documentos com array-contains-any
   * @param {string} collectionName - Nome da coleção
   * @param {string} field - Campo do filtro
   * @param {Array} values - Valores para o filtro
   * @param {string} academiaId - ID da academia (obrigatório para coleções isoladas)
   */
  getWhereArrayContainsAny: async (collectionName, field, values, academiaId = null) => {
    try {
      if (!Array.isArray(values) || values.length === 0) return [];
      
      const collectionRef = getCollectionRef(collectionName, academiaId);
      const q = query(collectionRef, where(field, 'array-contains-any', values));
      const querySnapshot = await getDocs(q);
      
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Ordenar em memória por createdAt desc
      return docs.sort((a, b) => {
        const aTime = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const bTime = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
    } catch (error) {
      console.error(`❌ Erro ao buscar documentos (array-contains-any) em ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Atualizar documento
   * @param {string} collectionName - Nome da coleção
   * @param {string} id - ID do documento
   * @param {Object} data - Dados para atualizar
   * @param {string} academiaId - ID da academia (obrigatório para coleções isoladas)
   */
  update: async (collectionName, id, data, academiaId = null) => {
    try {
      const docRef = getDocumentRef(collectionName, id, academiaId);
      
      // Para coleções isoladas, validar se o documento pertence à academia correta
      if (ACADEMY_ISOLATED_COLLECTIONS.includes(collectionName)) {
        const currentDoc = await getDoc(docRef);
        if (currentDoc.exists() && currentDoc.data().academiaId !== academiaId) {
          throw new Error(`Documento ${id} não pertence à academia ${academiaId}`);
        }
      }
      
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
      
      console.log(`✅ Documento atualizado em ${collectionName}${academiaId ? ` (academia: ${academiaId})` : ''}: ${id}`);
    } catch (error) {
      console.error(`❌ Erro ao atualizar documento ${id} em ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Deletar documento
   * @param {string} collectionName - Nome da coleção
   * @param {string} id - ID do documento
   * @param {string} academiaId - ID da academia (obrigatório para coleções isoladas)
   */
  delete: async (collectionName, id, academiaId = null) => {
    try {
      const docRef = getDocumentRef(collectionName, id, academiaId);
      
      // Para coleções isoladas, validar se o documento pertence à academia correta
      if (ACADEMY_ISOLATED_COLLECTIONS.includes(collectionName)) {
        const currentDoc = await getDoc(docRef);
        if (currentDoc.exists() && currentDoc.data().academiaId !== academiaId) {
          throw new Error(`Documento ${id} não pertence à academia ${academiaId}`);
        }
      }
      
      await deleteDoc(docRef);
      console.log(`✅ Documento deletado em ${collectionName}${academiaId ? ` (academia: ${academiaId})` : ''}: ${id}`);
    } catch (error) {
      console.error(`❌ Erro ao deletar documento ${id} em ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Buscar documentos com múltiplos filtros e ordenação
   * @param {string} collectionName - Nome da coleção
   * @param {string} academiaId - ID da academia (obrigatório para coleções isoladas)
   * @param {Array} filters - Array de filtros
   * @param {Object} orderByConfig - Configuração de ordenação
   * @param {number} limitCount - Limite de documentos
   */
  getDocuments: async (collectionName, academiaId = null, filters = [], orderByConfig = null, limitCount = null) => {
    try {
      let q = getCollectionRef(collectionName, academiaId);
      
      // Aplicar filtros
      if (filters && filters.length > 0) {
        filters.forEach(filter => {
          q = query(q, where(filter.field, filter.operator, filter.value));
        });
      }
      
      // Aplicar ordenação
      if (orderByConfig) {
        q = query(q, orderBy(orderByConfig.field, orderByConfig.direction || 'desc'));
      }
      
      // Aplicar limite
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`❌ Erro ao buscar documentos em ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Escutar mudanças em tempo real
   * @param {string} collectionName - Nome da coleção
   * @param {Function} callback - Callback para receber os dados
   * @param {string} academiaId - ID da academia (obrigatório para coleções isoladas)
   * @param {Array} filters - Filtros opcionais
   */
  listen: (collectionName, callback, academiaId = null, filters = []) => {
    try {
      let q = getCollectionRef(collectionName, academiaId);
      
      // Aplicar filtros se fornecidos
      if (filters.length > 0) {
        filters.forEach(filter => {
          q = query(q, where(filter.field, filter.operator, filter.value));
        });
      }
      
      q = query(q, orderBy('createdAt', 'desc'));
      
      return onSnapshot(q, (querySnapshot) => {
        const documents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(documents);
      });
    } catch (error) {
      console.error(`❌ Erro ao escutar mudanças em ${collectionName}:`, error);
      throw error;
    }
  }
};

// Serviços específicos para cada entidade com suporte a academy
export const academyStudentService = {
  getStudentsByClass: async (classId, academiaId) => {
    validateAcademiaId(academiaId, 'busca de alunos por turma');
    
    // Buscar alunos na coleção global 'users', mas filtrados por academiaId
    const usersInClass = await academyFirestoreService.getWhere('users', 'classIds', 'array-contains', classId);
    return usersInClass.filter(u => u.userType === 'student' && u.academiaId === academiaId);
  },

  getStudentsByInstructor: async (instructorId, academiaId) => {
    validateAcademiaId(academiaId, 'busca de alunos por instrutor');
    
    // Buscar turmas do instrutor na academia específica
    const classes = await academyFirestoreService.getWhere('classes', 'instructorId', '==', instructorId, academiaId);
    const classIds = (classes || []).map(c => c.id).filter(Boolean);
    if (classIds.length === 0) return [];
    
    // Buscar usuários (alunos) que estejam em quaisquer dessas turmas
    const usersInClasses = await academyFirestoreService.getWhereArrayContainsAny('users', 'classIds', classIds.slice(0, 10));
    return usersInClasses.filter(u => u.userType === 'student' && u.academiaId === academiaId);
  },

  addGraduation: async (studentId, graduation, academiaId) => {
    validateAcademiaId(academiaId, 'adição de graduação');
    
    // Criar registro de graduação na academia específica
    return await academyFirestoreService.create('graduations', {
      studentId,
      ...graduation
    }, academiaId);
  }
};

export const academyClassService = {
  getClassesByInstructor: async (instructorId, academiaId, instructorEmail = null) => {
    validateAcademiaId(academiaId, 'busca de turmas por instrutor');
    
    // Consulta principal: campo simples na academia específica
    const byId = await academyFirestoreService.getWhere('classes', 'instructorId', '==', instructorId, academiaId);
    
    // Alternativa: campo array com múltiplos instrutores
    const byIdsArray = await academyFirestoreService.getWhere('classes', 'instructorIds', 'array-contains', instructorId, academiaId).catch(() => []);
    
    // Alternativa opcional por email
    const byEmail = instructorEmail
      ? await academyFirestoreService.getWhere('classes', 'instructorEmail', '==', instructorEmail, academiaId).catch(() => [])
      : [];

    // Mesclar e remover duplicados por id
    const map = new Map();
    [...(byId || []), ...(byIdsArray || []), ...(byEmail || [])].forEach((c) => {
      if (c && c.id && !map.has(c.id)) map.set(c.id, c);
    });
    return Array.from(map.values());
  },

  getClassesByModality: async (modalityId, academiaId) => {
    validateAcademiaId(academiaId, 'busca de turmas por modalidade');
    return await academyFirestoreService.getWhere('classes', 'modalityId', '==', modalityId, academiaId);
  },

  checkIn: async (classId, studentId, academiaId) => {
    validateAcademiaId(academiaId, 'check-in');
    
    const checkInData = {
      classId,
      studentId,
      timestamp: new Date(),
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };
    
    return await academyFirestoreService.create('checkins', checkInData, academiaId);
  },

  getCheckIns: async (classId, date, academiaId) => {
    validateAcademiaId(academiaId, 'busca de check-ins');
    
    const checkIns = await academyFirestoreService.getWhere('checkins', 'classId', '==', classId, academiaId);
    return checkIns.filter(checkIn => checkIn.date === date);
  }
};

export const academyPaymentService = {
  getPaymentsByStudent: async (studentId, academiaId) => {
    validateAcademiaId(academiaId, 'busca de pagamentos por aluno');
    return await academyFirestoreService.getWhere('payments', 'studentId', '==', studentId, academiaId);
  },

  registerPayment: async (studentId, paymentData, academiaId) => {
    validateAcademiaId(academiaId, 'registro de pagamento');
    return await academyFirestoreService.create('payments', {
      studentId,
      ...paymentData
    }, academiaId);
  },

  getOverduePayments: async (academiaId) => {
    validateAcademiaId(academiaId, 'busca de pagamentos em atraso');
    
    const today = new Date().toISOString().split('T')[0];
    const payments = await academyFirestoreService.getWhere('payments', 'status', '==', 'pending', academiaId);
    return payments.filter(payment => payment.dueDate < today);
  }
};

export const academyAnnouncementService = {
  getActiveAnnouncements: async (academiaId, userType = null) => {
    validateAcademiaId(academiaId, 'busca de anúncios');
    
    try {
      const today = new Date();
      const announcements = await academyFirestoreService.getAll('announcements', academiaId);
      
      return announcements
        .filter(announcement => {
          // Verifica se o anúncio está ativo (não expirado)
          const isActive = !announcement.expirationDate || new Date(announcement.expirationDate) >= today;
          
          // Se não houver tipo de usuário definido, retorna todos os anúncios ativos
          if (!userType) return isActive;
          
          // Se o anúncio não tem restrição de tipo, está disponível para todos
          if (!announcement.targetUserTypes || announcement.targetUserTypes.length === 0) {
            return isActive;
          }
          
          // Verifica se o tipo de usuário atual está na lista de alvos do anúncio
          return isActive && announcement.targetUserTypes.includes(userType);
        })
        .sort((a, b) => {
          // Ordena por prioridade (maior primeiro) e depois por data de criação (mais recente primeiro)
          const priorityDiff = (b.priority || 0) - (a.priority || 0);
          if (priorityDiff !== 0) return priorityDiff;
          
          const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return bDate - aDate;
        });
    } catch (error) {
      console.error('❌ Erro ao buscar anúncios:', error);
      return [];
    }
  },
  
  createAnnouncement: async (announcementData, academiaId) => {
    validateAcademiaId(academiaId, 'criação de anúncio');
    
    try {
      return await academyFirestoreService.create('announcements', {
        ...announcementData,
        isActive: true
      }, academiaId);
    } catch (error) {
      console.error('❌ Erro ao criar anúncio:', error);
      throw error;
    }
  },
  
  updateAnnouncement: async (id, updates, academiaId) => {
    validateAcademiaId(academiaId, 'atualização de anúncio');
    
    try {
      await academyFirestoreService.update('announcements', id, updates, academiaId);
    } catch (error) {
      console.error('❌ Erro ao atualizar anúncio:', error);
      throw error;
    }
  },
  
  deleteAnnouncement: async (id, academiaId) => {
    validateAcademiaId(academiaId, 'remoção de anúncio');
    
    try {
      await academyFirestoreService.delete('announcements', id, academiaId);
    } catch (error) {
      console.error('❌ Erro ao remover anúncio:', error);
      throw error;
    }
  }
};

export const academyEventService = {
  getUpcomingEvents: async (academiaId) => {
    validateAcademiaId(academiaId, 'busca de eventos');
    
    const today = new Date().toISOString().split('T')[0];
    const events = await academyFirestoreService.getAll('events', academiaId);
    return events.filter(event => event.date >= today);
  },

  registerForEvent: async (eventId, studentId, registrationData, academiaId) => {
    validateAcademiaId(academiaId, 'registro em evento');
    
    return await academyFirestoreService.create('eventRegistrations', {
      eventId,
      studentId,
      ...registrationData
    }, academiaId);
  },

  getEventRegistrations: async (eventId, academiaId) => {
    validateAcademiaId(academiaId, 'busca de inscrições em evento');
    
    return await academyFirestoreService.getWhere('eventRegistrations', 'eventId', '==', eventId, academiaId);
  }
};

// Funcionalidade de auditoria
export const auditService = {
  logOperation: async (operation, collectionName, documentId, academiaId, userId, details = {}) => {
    try {
      await academyFirestoreService.create('audit_logs', {
        operation,
        collectionName,
        documentId,
        userId,
        details,
        timestamp: new Date()
      }, academiaId);
    } catch (error) {
      console.error('❌ Erro ao registrar auditoria:', error);
      // Não propagar erro de auditoria para não bloquear operação principal
    }
  }
};

export default academyFirestoreService;