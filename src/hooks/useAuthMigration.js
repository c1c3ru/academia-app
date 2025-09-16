import { useEffect, useRef } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import useAuthStore from '../stores/authStore';
import { normalizeUserProfile } from '../utils/userTypeHelpers';

// Variável global para controlar a inicialização do listener
let authListenerInitialized = false;
let authUnsubscribe = null;

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
        console.log('❌ fetchAcademiaData: Academia não encontrada, limpando associação do usuário');
        setAcademia(null);
        
        // Se a academia não existe mais, limpar a associação do usuário
        if (user?.uid) {
          try {
            await setDoc(doc(db, 'users', user.uid), {
              academiaId: null,
              updatedAt: new Date()
            }, { merge: true });
            
            // Atualizar o estado local
            const updatedProfile = { ...userProfile, academiaId: null };
            setUserProfile(updatedProfile);
          } catch (error) {
            console.error('❌ Erro ao limpar associação da academia:', error);
          }
        }
      }
    } catch (error) {
      console.error('❌ fetchAcademiaData: Erro ao buscar dados da academia:', error);
      setAcademia(null);
    }
  };

  // Função para buscar perfil do usuário
  const fetchUserProfile = async (userId, firebaseUser) => {
    try {
      console.log('🔍 fetchUserProfile: Buscando perfil do usuário:', userId);
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        console.log('✅ fetchUserProfile: Perfil encontrado');
        const profileData = { id: userId, ...userDoc.data() };
        setUserProfile(profileData);
        
        // Buscar dados da academia se o usuário tiver uma associada
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
      setUserProfile(null);
    }
  };

  // Listener do Firebase Auth
  useEffect(() => {
    // Evitar múltiplas inicializações usando variável global
    if (authListenerInitialized) {
      console.log('🔄 useAuthMigration: Listener já inicializado globalmente, pulando...');
      return;
    }

    console.log('🔄 useAuthMigration: Configurando listener do Firebase Auth');
    authListenerInitialized = true;
    setLoading(true);

    // Timeout de segurança para evitar loading infinito
    const loadingTimeout = setTimeout(() => {
      console.log('⚠️ useAuthMigration: Timeout de loading - forçando loading = false');
      setLoading(false);
    }, 5000);

    authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser ? 'Logado' : 'Deslogado');
      clearTimeout(loadingTimeout); // Cancelar timeout se auth resolver
      
      try {
        setUser(firebaseUser);
        
        if (firebaseUser) {
          await fetchUserProfile(firebaseUser.uid, firebaseUser);
        } else {
          setUserProfile(null);
          setAcademia(null);
        }
      } catch (error) {
        console.error('❌ Erro no auth state change:', error);
      } finally {
        console.log('🔄 useAuthMigration: Definindo loading como false');
        setLoading(false);
      }
    });

    return () => {
      console.log('🔄 useAuthMigration: Removendo listener do Firebase Auth');
      clearTimeout(loadingTimeout);
      if (authUnsubscribe) {
        authUnsubscribe();
        authUnsubscribe = null;
      }
      authListenerInitialized = false;
    };
  }, []); // Remover dependências que causam re-renders infinitos

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

  // Função de login com email e senha
  const signIn = async (email, password) => {
    try {
      console.log('🔐 Iniciando login com email e senha...');
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      
      console.log('✅ Login realizado com sucesso:', firebaseUser.email);
      return firebaseUser;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  };

  // Função para atualizar associação de academia
  const updateAcademiaAssociation = async (academiaId, academiaData = null) => {
    try {
      if (!user?.uid) {
        throw new Error('Usuário não autenticado');
      }
      
      console.log('🏢 updateAcademiaAssociation: Associando usuário à academia:', academiaId);
      
      // Atualizar perfil do usuário com a academia
      await setDoc(doc(db, 'users', user.uid), {
        academiaId: academiaId,
        updatedAt: new Date()
      }, { merge: true });
      
      // Atualizar estado local
      const updatedProfile = { ...userProfile, academiaId };
      setUserProfile(updatedProfile);
      
      // Se dados da academia foram fornecidos, definir no estado
      if (academiaData) {
        setAcademia({ id: academiaId, ...academiaData });
      } else if (academiaId) {
        // Buscar dados da academia
        await fetchAcademiaData(academiaId);
      }
      
      console.log('✅ updateAcademiaAssociation: Associação atualizada com sucesso');
      
      return updatedProfile;
    } catch (error) {
      console.error('❌ updateAcademiaAssociation: Erro ao atualizar associação:', error);
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
    signIn,
    setUser,
    setUserProfile,
    setAcademia,
    fetchUserProfile,
    fetchAcademiaData,
    updateUserProfile,
    updateAcademiaAssociation,
    signInWithGoogle,
    signInWithFacebook,
    signInWithMicrosoft,
    signInWithApple
  };
};

export default useAuthMigration;
