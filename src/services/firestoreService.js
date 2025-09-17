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

// Serviços genéricos para CRUD
export const firestoreService = {
  // Criar documento
  create: async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Erro ao criar documento em ${collectionName}:`, error);
      throw error;
    }
  },

  // Buscar documentos com array-contains-any
  getWhereArrayContainsAny: async (collectionName, field, values) => {
    try {
      if (!Array.isArray(values) || values.length === 0) return [];
      const q = query(
        collection(db, collectionName),
        where(field, 'array-contains-any', values)
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Ordenar em memória por createdAt desc
      return docs.sort((a, b) => {
        const aTime = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const bTime = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
    } catch (error) {
      console.error(`Erro ao buscar documentos (array-contains-any) em ${collectionName}:`, error);
      throw error;
    }
  },

  // Buscar documento por ID
  getById: async (collectionName, id) => {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Erro ao buscar documento ${id} em ${collectionName}:`, error);
      throw error;
    }
  },

  // Buscar todos os documentos de uma coleção
  getAll: async (collectionName, orderByField = 'createdAt', orderDirection = 'desc') => {
    try {
      const q = query(
        collection(db, collectionName),
        orderBy(orderByField, orderDirection)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Erro ao buscar documentos em ${collectionName}:`, error);
      throw error;
    }
  },

  // Buscar documentos com filtro
  getWhere: async (collectionName, field, operator, value) => {
    try {
      // Evitar índices compostos quando não necessário: sem orderBy adicional
      const q = query(
        collection(db, collectionName),
        where(field, operator, value)
      );
      const querySnapshot = await getDocs(q);
      
      // Ordenar em memória por createdAt desc para manter comportamento anterior
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return docs.sort((a, b) => {
        const aTime = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const bTime = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
    } catch (error) {
      console.error(`Erro ao buscar documentos filtrados em ${collectionName}:`, error);
      throw error;
    }
  },

  // Atualizar documento
  update: async (collectionName, id, data) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Erro ao atualizar documento ${id} em ${collectionName}:`, error);
      throw error;
    }
  },

  // Deletar documento
  delete: async (collectionName, id) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Erro ao deletar documento ${id} em ${collectionName}:`, error);
      throw error;
    }
  },

  // Buscar documentos com múltiplos filtros e ordenação
  getDocuments: async (collectionName, filters = [], orderByConfig = null, limitCount = null) => {
    try {
      let q = collection(db, collectionName);
      
      // Aplicar filtros
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
      
      // Aplicar ordenação se especificada
      if (orderByConfig) {
        q = query(q, orderBy(orderByConfig.field, orderByConfig.direction || 'asc'));
      }
      
      // Aplicar limite se especificado
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Erro ao buscar documentos de ${collectionName}:`, error);
      throw error;
    }
  },

  // Listener para mudanças em tempo real
  subscribeToDocument: (collectionName, id, callback) => {
    const docRef = doc(db, collectionName, id);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  },

  subscribeToCollection: (collectionName, callback, filters = []) => {
    let q = collection(db, collectionName);
    
    filters.forEach(filter => {
      q = query(q, where(filter.field, filter.operator, filter.value));
    });
    
    return onSnapshot(q, (querySnapshot) => {
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(docs);
    });
  },

  // Compatibility methods for paymentService
  addDocument: async (collectionName, data) => {
    return await firestoreService.create(collectionName, data);
  },

  updateDocument: async (collectionName, id, data) => {
    return await firestoreService.update(collectionName, id, data);
  },

  getDocument: async (collectionName, id) => {
    return await firestoreService.getById(collectionName, id);
  },

  getDocumentsWithFilters: async (collectionName, filters) => {
    return await firestoreService.getDocuments(collectionName, filters);
  },

  deleteDocument: async (collectionName, id) => {
    return await firestoreService.delete(collectionName, id);
  }
};

// Serviços específicos para cada entidade
export const studentService = {
  getStudentsByClass: async (classId) => {
    // Ajuste: alunos estão na coleção 'users' com userType 'student'
    const usersInClass = await firestoreService.getWhere('users', 'classIds', 'array-contains', classId);
    return usersInClass.filter(u => u.userType === 'student');
  },

  getStudentsByInstructor: async (instructorId) => {
    // Buscar turmas do instrutor
    const classes = await firestoreService.getWhere('classes', 'instructorId', '==', instructorId);
    const classIds = (classes || []).map(c => c.id).filter(Boolean);
    if (classIds.length === 0) return [];
    // Buscar usuários (alunos) que estejam em quaisquer dessas turmas
    const usersInClasses = await firestoreService.getWhereArrayContainsAny('users', 'classIds', classIds.slice(0, 10));
    return usersInClasses.filter(u => u.userType === 'student');
  },

  addGraduation: async (studentId, graduation) => {
    const student = await firestoreService.getById('students', studentId);
    if (student) {
      const updatedGraduations = [...(student.graduations || []), graduation];
      await firestoreService.update('students', studentId, {
        graduations: updatedGraduations,
        currentGraduation: graduation.graduation
      });
    }
  }
};

export const classService = {
  // Busca turmas vinculadas ao instrutor, cobrindo diferentes variantes de schema
  // Preferência: instructorId == uid, depois instructorIds array-contains uid, e opcionalmente por email
  getClassesByInstructor: async (instructorId, instructorEmail) => {
    // Consulta principal: campo simples
    const byId = await firestoreService.getWhere('classes', 'instructorId', '==', instructorId);
    // Alternativa: campo array com múltiplos instrutores
    const byIdsArray = await firestoreService.getWhere('classes', 'instructorIds', 'array-contains', instructorId).catch(() => []);
    // Alternativa opcional por email (alguns dados antigos podem referenciar email)
    const byEmail = instructorEmail
      ? await firestoreService.getWhere('classes', 'instructorEmail', '==', instructorEmail).catch(() => [])
      : [];

    // Mesclar e remover duplicados por id
    const map = new Map();
    [...(byId || []), ...(byIdsArray || []), ...(byEmail || [])].forEach((c) => {
      if (c && c.id && !map.has(c.id)) map.set(c.id, c);
    });
    return Array.from(map.values());
  },

  getClassesByModality: async (modalityId) => {
    return await firestoreService.getWhere('classes', 'modalityId', '==', modalityId);
  },

  checkIn: async (classId, studentId) => {
    const checkInData = {
      classId,
      studentId,
      timestamp: new Date(),
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };
    
    return await firestoreService.create('checkIns', checkInData);
  },

  getCheckIns: async (classId, date) => {
    const checkIns = await firestoreService.getWhere('checkIns', 'classId', '==', classId);
    return checkIns.filter(checkIn => checkIn.date === date);
  }
};

export const paymentService = {
  getPaymentsByStudent: async (studentId) => {
    return await firestoreService.getWhere('payments', 'studentId', '==', studentId);
  },

  registerPayment: async (studentId, paymentData) => {
    return await firestoreService.create('payments', {
      studentId,
      ...paymentData
    });
  },

  getOverduePayments: async () => {
    const today = new Date().toISOString().split('T')[0];
    const payments = await firestoreService.getWhere('payments', 'status', '==', 'pending');
    return payments.filter(payment => payment.dueDate < today);
  }
};

export const announcementService = {
  /**
   * Busca anúncios ativos, opcionalmente filtrando por tipo de usuário
   * @param {string} userType - Tipo de usuário para filtrar os anúncios (admin, instructor, student)
   * @returns {Promise<Array>} Lista de anúncios ativos
   */
  getActiveAnnouncements: async (userType = null) => {
    try {
      const today = new Date();
      const announcements = await firestoreService.getAll('announcements');
      
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
      console.error('Erro ao buscar anúncios:', error);
      return [];
    }
  },
  
  /**
   * Cria um novo anúncio
   * @param {Object} announcementData - Dados do anúncio
   * @returns {Promise<string>} ID do anúncio criado
   */
  createAnnouncement: async (announcementData) => {
    try {
      return await firestoreService.create('announcements', {
        ...announcementData,
        createdAt: new Date(),
        isActive: true
      });
    } catch (error) {
      console.error('Erro ao criar anúncio:', error);
      throw error;
    }
  },
  
  /**
   * Atualiza um anúncio existente
   * @param {string} id - ID do anúncio
   * @param {Object} updates - Campos para atualizar
   * @returns {Promise<void>}
   */
  updateAnnouncement: async (id, updates) => {
    try {
      await firestoreService.update('announcements', id, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar anúncio:', error);
      throw error;
    }
  },
  
  /**
   * Remove um anúncio
   * @param {string} id - ID do anúncio
   * @returns {Promise<void>}
   */
  deleteAnnouncement: async (id) => {
    try {
      await firestoreService.delete('announcements', id);
    } catch (error) {
      console.error('Erro ao remover anúncio:', error);
      throw error;
    }
  }
};

export const eventService = {
  getUpcomingEvents: async () => {
    const today = new Date().toISOString().split('T')[0];
    const events = await firestoreService.getAll('events');
    return events.filter(event => event.date >= today);
  },

  registerForEvent: async (eventId, studentId, registrationData) => {
    return await firestoreService.create('eventRegistrations', {
      eventId,
      studentId,
      ...registrationData
    });
  },

  getEventRegistrations: async (eventId) => {
    return await firestoreService.getWhere('eventRegistrations', 'eventId', '==', eventId);
  }
};

