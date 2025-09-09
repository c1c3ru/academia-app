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
      console.error(`Erro ao buscar documentos em ${collectionName}:`, error);
      throw error;
    }
  },

  // Escutar mudanças em tempo real
  listen: (collectionName, callback, filters = []) => {
    try {
      let q = collection(db, collectionName);
      
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
      console.error(`Erro ao escutar mudanças em ${collectionName}:`, error);
      throw error;
    }
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
  getActiveAnnouncements: async () => {
    const today = new Date();
    const announcements = await firestoreService.getAll('announcements');
    return announcements.filter(announcement => 
      !announcement.expirationDate || new Date(announcement.expirationDate) >= today
    );
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

