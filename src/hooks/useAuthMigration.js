import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import useAuthStore from '../stores/authStore';

// Hook para migrar dados do Context API para Zustand
export const useAuthMigration = () => {
  const {
    setUser,
    setUserProfile,
    setAcademia,
    setLoading,
    login,
    logout,
    user,
    userProfile,
    academia,
    loading,
    isAuthenticated,
    getUserType,
    isComplete
  } = useAuthStore();

  // Função para buscar dados da academia
  const fetchAcademiaData = async (academiaId) => {
    try {
      console.log('🏢 fetchAcademiaData: Buscando dados da academia:', academiaId);
      const academiaDoc = await getDoc(doc(db, 'academias', academiaId));
      if (academiaDoc.exists()) {
        console.log('✅ fetchAcademiaData: Academia encontrada');
        setAcademia({
          id: academiaId,
          ...academiaDoc.data()
        });
      } else {
        console.log('❌ fetchAcademiaData: Academia não encontrada');
        setAcademia(null);
      }
    } catch (error) {
      console.error('❌ fetchAcademiaData: Erro ao buscar dados da academia:', error);
    }
  };

  // Função para buscar perfil do usuário
  const fetchUserProfile = async (userId) => {
    try {
      console.log('👤 fetchUserProfile: Buscando perfil do usuário:', userId);
      const userDoc = await getDoc(doc(db, 'usuarios', userId));
      if (userDoc.exists()) {
        const profileData = { id: userId, ...userDoc.data() };
        console.log('✅ fetchUserProfile: Perfil encontrado:', profileData.tipo || profileData.userType);
        setUserProfile(profileData);
        
        // Se tem academia associada, buscar dados da academia
        if (profileData.academiaId) {
          await fetchAcademiaData(profileData.academiaId);
        }
      } else {
        console.log('❌ fetchUserProfile: Perfil não encontrado');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('❌ fetchUserProfile: Erro ao buscar perfil:', error);
    }
  };

  // Listener do Firebase Auth
  useEffect(() => {
    console.log('🔄 useAuthMigration: Configurando listener do Firebase Auth');
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser ? 'Logado' : 'Deslogado');
      
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserProfile(firebaseUser.uid);
      } else {
        logout();
      }
      
      setLoading(false);
    });

    return () => {
      console.log('🔄 useAuthMigration: Removendo listener do Firebase Auth');
      unsubscribe();
    };
  }, []);

  // Retornar interface compatível com o Context API antigo
  return {
    user,
    userProfile,
    academia,
    loading,
    isAuthenticated,
    getUserType,
    isComplete: isComplete(),
    login,
    logout,
    setUser,
    setUserProfile,
    setAcademia,
    fetchUserProfile,
    fetchAcademiaData
  };
};

export default useAuthMigration;
