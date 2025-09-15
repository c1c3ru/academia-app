import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, getDoc, addDoc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook personalizado para acessar dados de uma coleção específica da academia
 * @param {string} collectionName - Nome da subcoleção (alunos, instrutores, turmas, etc.)
 * @param {object} options - Opções adicionais como filtros
 * @returns {object} { data, loading, error, addItem, updateItem, deleteItem }
 */
export function useAcademiaCollection(collectionName, options = {}) {
  const { userProfile, academia } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userProfile?.academiaId || !academia) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Referência para a subcoleção da academia
      const collectionRef = collection(db, 'gyms', userProfile.academiaId, collectionName);
      
      // Aplicar filtros se fornecidos
      let queryRef = collectionRef;
      if (options.where) {
        queryRef = query(collectionRef, where(options.where.field, options.where.operator, options.where.value));
      }

      // Listener em tempo real
      const unsubscribe = onSnapshot(queryRef, 
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setData(items);
          setLoading(false);
        },
        (err) => {
          console.error(`Erro ao buscar ${collectionName}:`, err);
          setError(err);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error(`Erro ao configurar listener para ${collectionName}:`, err);
      setError(err);
      setLoading(false);
    }
  }, [userProfile?.academiaId, academia, collectionName, options.where]);

  // Função para adicionar item
  const addItem = async (itemData) => {
    if (!userProfile?.academiaId) {
      throw new Error('Academia não identificada');
    }

    try {
      const collectionRef = collection(db, 'gyms', userProfile.academiaId, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...itemData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Erro ao adicionar ${collectionName}:`, error);
      throw error;
    }
  };

  // Função para atualizar item
  const updateItem = async (itemId, updates) => {
    if (!userProfile?.academiaId) {
      throw new Error('Academia não identificada');
    }

    try {
      const docRef = doc(db, 'gyms', userProfile.academiaId, collectionName, itemId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Erro ao atualizar ${collectionName}:`, error);
      throw error;
    }
  };

  // Função para deletar item
  const deleteItem = async (itemId) => {
    if (!userProfile?.academiaId) {
      throw new Error('Academia não identificada');
    }

    try {
      const docRef = doc(db, 'gyms', userProfile.academiaId, collectionName, itemId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Erro ao deletar ${collectionName}:`, error);
      throw error;
    }
  };

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem
  };
}

/**
 * Hook para buscar um item específico de uma coleção da academia
 * @param {string} collectionName - Nome da subcoleção
 * @param {string} itemId - ID do item
 * @returns {object} { data, loading, error }
 */
export function useAcademiaDocument(collectionName, itemId) {
  const { userProfile, academia } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userProfile?.academiaId || !academia || !itemId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchDocument = async () => {
      try {
        const docRef = doc(db, 'gyms', userProfile.academiaId, collectionName, itemId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setData({
            id: docSnap.id,
            ...docSnap.data()
          });
        } else {
          setData(null);
        }
        setLoading(false);
      } catch (err) {
        console.error(`Erro ao buscar documento ${itemId} de ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    };

    fetchDocument();
  }, [userProfile?.academiaId, academia, collectionName, itemId]);

  return { data, loading, error };
}

/**
 * Hooks específicos para cada tipo de dados
 */
export const useAlunos = (options) => useAcademiaCollection('alunos', options);
export const useInstrutores = (options) => useAcademiaCollection('instrutores', options);
export const useTurmas = (options) => useAcademiaCollection('turmas', options);
export const usePagamentos = (options) => useAcademiaCollection('pagamentos', options);
export const useCheckins = (options) => useAcademiaCollection('checkins', options);
export const usePlanos = (options) => useAcademiaCollection('planos', options);

/**
 * Hook para estatísticas da academia
 */
export function useAcademiaStats() {
  const { data: alunos, loading: loadingAlunos } = useAlunos();
  const { data: turmas, loading: loadingTurmas } = useTurmas();
  const { data: pagamentos, loading: loadingPagamentos } = usePagamentos();

  const loading = loadingAlunos || loadingTurmas || loadingPagamentos;

  const stats = {
    totalAlunos: alunos?.length || 0,
    totalTurmas: turmas?.length || 0,
    alunosAtivos: alunos?.filter(aluno => aluno.status === 'ativo')?.length || 0,
    turmasAtivas: turmas?.filter(turma => turma.status === 'ativa')?.length || 0,
    receitaMensal: pagamentos?.reduce((total, pagamento) => {
      const pagamentoDate = pagamento.createdAt?.toDate?.() || new Date(pagamento.createdAt);
      const isCurrentMonth = pagamentoDate.getMonth() === new Date().getMonth() && 
                            pagamentoDate.getFullYear() === new Date().getFullYear();
      return isCurrentMonth ? total + (pagamento.valor || 0) : total;
    }, 0) || 0
  };

  return { stats, loading };
}
