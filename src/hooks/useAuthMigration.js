import { useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
      const academiaDoc = await getDoc(doc(db, 'gyms', academiaId));
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
  const fetchUserProfile = async (userId, firebaseUser = null) => {
    try {
      console.log('👤 fetchUserProfile: Buscando perfil do usuário:', userId);
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const profileData = { id: userId, ...userDoc.data() };
        console.log('✅ fetchUserProfile: Perfil encontrado:', profileData.tipo || profileData.userType);
        setUserProfile(profileData);
        
        // Se tem academia associada, buscar dados da academia
        if (profileData.academiaId) {
          await fetchAcademiaData(profileData.academiaId);
        }
      } else {
        console.log('❌ fetchUserProfile: Perfil não encontrado, criando perfil básico...');
        
        // Criar perfil básico se não existir
        const basicProfile = {
          name: firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'Usuário',
          email: firebaseUser?.email || '',
          photoURL: firebaseUser?.photoURL || null,
          tipo: null, // Será definido na tela de seleção
          userType: null, // Será definido na tela de seleção
          profileCompleted: false, // Indica que precisa completar o perfil
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(doc(db, 'users', userId), basicProfile);
        console.log('✅ fetchUserProfile: Perfil básico criado');
        
        const profileData = { id: userId, ...basicProfile };
        setUserProfile(profileData);
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
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid, firebaseUser);
      } else {
        setUserProfile(null);
        setAcademia(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('🔄 useAuthMigration: Removendo listener do Firebase Auth');
      unsubscribe();
    };
  }, []);

  // Funções de login social
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      // Verificar se o usuário já existe no Firestore
      let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Criar perfil básico para usuário do Google
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          tipo: null, // Será definido na tela de seleção
          userType: null, // Será definido na tela de seleção
          profileCompleted: false, // Indica que precisa completar o perfil
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      return firebaseUser;
    } catch (error) {
      console.error('Erro no login Google:', error);
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      provider.addScope('public_profile');
      
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      // Verificar se o usuário já existe no Firestore
      let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          tipo: null, // Será definido na tela de seleção
          userType: null, // Será definido na tela de seleção
          profileCompleted: false, // Indica que precisa completar o perfil
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      return firebaseUser;
    } catch (error) {
      console.error('Erro no login Facebook:', error);
      throw error;
    }
  };

  const signInWithMicrosoft = async () => {
    try {
      const provider = new OAuthProvider('microsoft.com');
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          tipo: null, // Será definido na tela de seleção
          userType: null, // Será definido na tela de seleção
          profileCompleted: false, // Indica que precisa completar o perfil
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      return firebaseUser;
    } catch (error) {
      console.error('Erro no login Microsoft:', error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name: firebaseUser.displayName || 'Usuário Apple',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          tipo: null, // Será definido na tela de seleção
          userType: null, // Será definido na tela de seleção
          profileCompleted: false, // Indica que precisa completar o perfil
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      return firebaseUser;
    } catch (error) {
      console.error('Erro no login Apple:', error);
      throw error;
    }
  };

  // Função para atualizar perfil do usuário
  const updateUserProfile = async (updates) => {
    try {
      if (!user?.uid) {
        throw new Error('Usuário não autenticado');
      }
      
      console.log('🔄 updateUserProfile: Atualizando perfil:', updates);
      
      // Atualizar no Firestore
      await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
      
      // Atualizar no Zustand store
      const currentProfile = userProfile || {};
      const updatedProfile = { ...currentProfile, ...updates };
      setUserProfile(updatedProfile);
      
      console.log('✅ updateUserProfile: Perfil atualizado com sucesso');
      
      return updatedProfile;
    } catch (error) {
      console.error('❌ updateUserProfile: Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  // Função de logout
  const logoutUser = async () => {
    try {
      console.log('🚪 Iniciando logout...');
      
      // Fazer signOut do Firebase
      await signOut(auth);
      
      // Limpar estado do Zustand
      logout(); // Chama a função logout do store
      
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      throw error;
    }
  };

  return {
    user,
    userProfile,
    academia,
    loading,
    isAuthenticated,
    getUserType,
    isComplete: isComplete(),
    login,
    logout: logoutUser,
    setUser,
    setUserProfile,
    setAcademia,
    fetchUserProfile,
    fetchAcademiaData,
    updateUserProfile,
    signInWithGoogle,
    signInWithFacebook,
    signInWithMicrosoft,
    signInWithApple
  };
};

export default useAuthMigration;
