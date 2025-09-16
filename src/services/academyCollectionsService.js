import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Service para gerenciar coleções específicas de cada academia
 * Substitui as coleções globais por subcoleções isoladas por academia
 */
class AcademyCollectionsService {
  
  /**
   * Obter referência para uma subcoleção da academia
   */
  getAcademyCollection(academiaId, collectionName) {
    if (!academiaId) {
      throw new Error('academiaId é obrigatório');
    }
    return collection(db, 'gyms', academiaId, collectionName);
  }

  /**
   * Obter referência para um documento específico de uma subcoleção
   */
  getAcademyDocument(academiaId, collectionName, docId) {
    if (!academiaId) {
      throw new Error('academiaId é obrigatório');
    }
    return doc(db, 'gyms', academiaId, collectionName, docId);
  }

  /**
   * Buscar todas as modalidades de uma academia
   */
  async getModalities(academiaId) {
    try {
      const modalitiesRef = this.getAcademyCollection(academiaId, 'modalities');
      const snapshot = await getDocs(modalitiesRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar modalidades:', error);
      throw error;
    }
  }

  /**
   * Criar uma nova modalidade
   */
  async createModality(academiaId, modalityData) {
    try {
      const modalitiesRef = this.getAcademyCollection(academiaId, 'modalities');
      const docRef = await addDoc(modalitiesRef, {
        ...modalityData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar modalidade:', error);
      throw error;
    }
  }

  /**
   * Atualizar uma modalidade
   */
  async updateModality(academiaId, modalityId, modalityData) {
    try {
      const modalityRef = this.getAcademyDocument(academiaId, 'modalities', modalityId);
      await updateDoc(modalityRef, {
        ...modalityData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar modalidade:', error);
      throw error;
    }
  }

  /**
   * Deletar uma modalidade
   */
  async deleteModality(academiaId, modalityId) {
    try {
      const modalityRef = this.getAcademyDocument(academiaId, 'modalities', modalityId);
      await deleteDoc(modalityRef);
    } catch (error) {
      console.error('Erro ao deletar modalidade:', error);
      throw error;
    }
  }

  /**
   * Buscar todos os planos de uma academia
   */
  async getPlans(academiaId) {
    try {
      const plansRef = this.getAcademyCollection(academiaId, 'plans');
      const snapshot = await getDocs(plansRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      throw error;
    }
  }

  /**
   * Criar um novo plano
   */
  async createPlan(academiaId, planData) {
    try {
      const plansRef = this.getAcademyCollection(academiaId, 'plans');
      const docRef = await addDoc(plansRef, {
        ...planData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      throw error;
    }
  }

  /**
   * Atualizar um plano
   */
  async updatePlan(academiaId, planId, planData) {
    try {
      const planRef = this.getAcademyDocument(academiaId, 'plans', planId);
      await updateDoc(planRef, {
        ...planData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      throw error;
    }
  }

  /**
   * Deletar um plano
   */
  async deletePlan(academiaId, planId) {
    try {
      const planRef = this.getAcademyDocument(academiaId, 'plans', planId);
      await deleteDoc(planRef);
    } catch (error) {
      console.error('Erro ao deletar plano:', error);
      throw error;
    }
  }

  /**
   * Buscar todos os avisos de uma academia
   */
  async getAnnouncements(academiaId) {
    try {
      const announcementsRef = this.getAcademyCollection(academiaId, 'announcements');
      const q = query(announcementsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar avisos:', error);
      throw error;
    }
  }

  /**
   * Criar um novo aviso
   */
  async createAnnouncement(academiaId, announcementData) {
    try {
      const announcementsRef = this.getAcademyCollection(academiaId, 'announcements');
      const docRef = await addDoc(announcementsRef, {
        ...announcementData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar aviso:', error);
      throw error;
    }
  }

  /**
   * Atualizar um aviso
   */
  async updateAnnouncement(academiaId, announcementId, announcementData) {
    try {
      const announcementRef = this.getAcademyDocument(academiaId, 'announcements', announcementId);
      await updateDoc(announcementRef, {
        ...announcementData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar aviso:', error);
      throw error;
    }
  }

  /**
   * Deletar um aviso
   */
  async deleteAnnouncement(academiaId, announcementId) {
    try {
      const announcementRef = this.getAcademyDocument(academiaId, 'announcements', announcementId);
      await deleteDoc(announcementRef);
    } catch (error) {
      console.error('Erro ao deletar aviso:', error);
      throw error;
    }
  }

  /**
   * Buscar todos os níveis de graduação de uma academia
   */
  async getGraduationLevels(academiaId) {
    try {
      const levelsRef = this.getAcademyCollection(academiaId, 'graduation_levels');
      const snapshot = await getDocs(levelsRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar níveis de graduação:', error);
      throw error;
    }
  }

  /**
   * Criar um novo nível de graduação
   */
  async createGraduationLevel(academiaId, levelData) {
    try {
      const levelsRef = this.getAcademyCollection(academiaId, 'graduation_levels');
      const docRef = await addDoc(levelsRef, {
        ...levelData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar nível de graduação:', error);
      throw error;
    }
  }

  /**
   * Atualizar um nível de graduação
   */
  async updateGraduationLevel(academiaId, levelId, levelData) {
    try {
      const levelRef = this.getAcademyDocument(academiaId, 'graduation_levels', levelId);
      await updateDoc(levelRef, {
        ...levelData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar nível de graduação:', error);
      throw error;
    }
  }

  /**
   * Deletar um nível de graduação
   */
  async deleteGraduationLevel(academiaId, levelId) {
    try {
      const levelRef = this.getAcademyDocument(academiaId, 'graduation_levels', levelId);
      await deleteDoc(levelRef);
    } catch (error) {
      console.error('Erro ao deletar nível de graduação:', error);
      throw error;
    }
  }

  /**
   * Método genérico para buscar qualquer subcoleção
   */
  async getCollection(academiaId, collectionName) {
    try {
      const collectionRef = this.getAcademyCollection(academiaId, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Erro ao buscar ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Método genérico para criar documento em qualquer subcoleção
   */
  async createDocument(academiaId, collectionName, data) {
    try {
      const collectionRef = this.getAcademyCollection(academiaId, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return docRef.id;
    } catch (error) {
      console.error(`Erro ao criar documento em ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Método genérico para atualizar documento em qualquer subcoleção
   */
  async updateDocument(academiaId, collectionName, docId, data) {
    try {
      const docRef = this.getAcademyDocument(academiaId, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Erro ao atualizar documento em ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Método genérico para deletar documento em qualquer subcoleção
   */
  async deleteDocument(academiaId, collectionName, docId) {
    try {
      const docRef = this.getAcademyDocument(academiaId, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Erro ao deletar documento em ${collectionName}:`, error);
      throw error;
    }
  }
}

// Exportar instância singleton
export const academyCollectionsService = new AcademyCollectionsService();
export default academyCollectionsService;
