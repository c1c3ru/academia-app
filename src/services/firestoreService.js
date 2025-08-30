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
      const q = query(
        collection(db, collectionName),
        where(field, operator, value),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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
    return await firestoreService.getWhere('students', 'classIds', 'array-contains', classId);
  },

  getStudentsByInstructor: async (instructorId) => {
    return await firestoreService.getWhere('students', 'instructorId', '==', instructorId);
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
  getClassesByInstructor: async (instructorId) => {
    return await firestoreService.getWhere('classes', 'instructorId', '==', instructorId);
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

