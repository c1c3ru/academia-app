import { useEffect, useRef } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import useAuthStore from '../stores/authStore';
import { normalizeUserProfile } from '../utils/userTypeHelpers';
import { getUserClaims, refreshUserToken } from '../utils/customClaimsHelper';

// Variável global para controlar a inicialização do listener
let authListenerInitialized = false;
let authUnsubscribe = null;

// Hook para migrar dados do Context API para Zustand
export const useAuthMigration = () => {
  const {
    setUser,
    setUserProfile,
    setAcademia,
    setCustomClaims,
    setLoading,
    login,
    logout,
    user,
    userProfile,
    academia,
    customClaims,
    loading,
    isAuthenticated,
    getUserType,
    isComplete,
    hasValidClaims
  } = useAuthStore();

  // Função para carregar Custom Claims
  const loadCustomClaims = async (user) => {
    try {
      console.log('🔍 loadCustomClaims: Carregando claims para:', user.email);
      const claims = await getUserClaims(user);
      console.log('📋 loadCustomClaims: Claims carregados:', claims);
      setCustomClaims(claims);
    } catch (error) {
      console.error('❌ loadCustomClaims: Erro ao carregar claims:', error);
      
      // Se for erro de conectividade, tentar novamente
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        console.log('🔄 loadCustomClaims: Cliente offline, tentando novamente em 3s...');
        setTimeout(() => {
          if (user) {
            loadCustomClaims(user);
          }
        }, 3000);
      } else {
        setCustomClaims(null);
      }
    }
  };

  // Função para buscar dados da academia
  const fetchAcademiaData = async (academiaId) => {
    try {
      console.log('🏢 fetchAcademiaData: Buscando dados da academia:', academiaId);
      console.log('🔍 fetchAcademiaData: Tentando buscar em /gyms/' + academiaId);
      
      const academiaDoc = await getDoc(doc(db, 'gyms', academiaId));
      console.log('📄 fetchAcademiaData: Documento existe?', academiaDoc.exists());
      
      if (academiaDoc.exists()) {
        const academiaData = academiaDoc.data();
        console.log('✅ fetchAcademiaData: Academia encontrada:', academiaData.name || 'Sem nome');
        setAcademia({
          id: academiaId,
          ...academiaData
        });
      } else {
        console.log('❌ fetchAcademiaData: Academia não encontrada na coleção gyms');
        console.log('🔍 fetchAcademiaData: Tentando buscar em /academias/' + academiaId);
        
        // Tentar buscar na coleção alternativa 'academias'
        const academiaDocAlt = await getDoc(doc(db, 'academias', academiaId));
        console.log('📄 fetchAcademiaData: Documento existe em academias?', academiaDocAlt.exists());
        
        if (academiaDocAlt.exists()) {
          const academiaData = academiaDocAlt.data();
          console.log('✅ fetchAcademiaData: Academia encontrada em academias:', academiaData.name || 'Sem nome');
          setAcademia({
            id: academiaId,
            ...academiaData
          });
        } else {
          console.log('❌ fetchAcademiaData: Academia não encontrada em nenhuma coleção');
          setAcademia(null);
          
          // Se a academia não existe mais, limpar apenas o estado local
          if (userProfile?.academiaId) {
            console.log('⚠️ fetchAcademiaData: Limpando associação local da academia inexistente');
            const updatedProfile = { ...userProfile, academiaId: null };
            setUserProfile(updatedProfile);
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
        
        // Buscar dados da academia se o usuário tiver uma associada no perfil
        // Os claims serão verificados separadamente após serem carregados
        if (profileData.academiaId) {
          console.log('🏢 fetchUserProfile: Buscando academia do perfil:', profileData.academiaId);
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
      
      // Se for erro de conectividade, tentar novamente após um delay
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        console.log('🔄 fetchUserProfile: Cliente offline, tentando novamente em 5s...');
        setTimeout(() => {
          if (userId) {
            fetchUserProfile(userId);
          }
        }, 5000);
      } else {
        setUserProfile(null);
      }
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
          // Carregar Custom Claims primeiro
          const claims = await loadCustomClaims(firebaseUser);
          
          // Depois carregar perfil do usuário
          await fetchUserProfile(firebaseUser.uid, firebaseUser);
          
          // Se claims têm academia mas perfil não tem, buscar dados da academia dos claims
          const currentProfile = useAuthStore.getState().userProfile;
          const currentAcademia = useAuthStore.getState().academia;
          
          if (claims?.academiaId && !currentProfile?.academiaId && !currentAcademia) {
            console.log('🏢 Auth: Claims têm academia mas perfil não, buscando academia dos claims:', claims.academiaId);
            await fetchAcademiaData(claims.academiaId);
          }
        } else {
          setUserProfile(null);
          setAcademia(null);
          setCustomClaims(null);
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

  // Função para atualizar claims após operações das Cloud Functions
  const refreshClaimsAndProfile = async () => {
    try {
      console.log('🔄 refreshClaimsAndProfile: Atualizando claims e perfil...');
      
      if (!user) {
        console.log('⚠️ refreshClaimsAndProfile: Nenhum usuário logado');
        return;
      }
      
      // Forçar refresh do token para obter claims atualizados
      await refreshUserToken();
      
      // Recarregar claims
      await loadCustomClaims(user);
      
      // Recarregar perfil do usuário
      await fetchUserProfile(user.uid, user);
      
      console.log('✅ refreshClaimsAndProfile: Claims e perfil atualizados');
    } catch (error) {
      console.error('❌ refreshClaimsAndProfile: Erro na atualização:', error);
      throw error;
    }
  };

  // Função de cadastro
  const signUp = async (email, password, userData) => {
    try {
      console.log('📝 Iniciando cadastro para:', email);
      
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Criar perfil do usuário na coleção 'users'
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        email,
        userType: userData.userType || 'student', // Padrão para student
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('✅ Usuário criado com sucesso:', firebaseUser.uid);
      
      // Carregar perfil do usuário
      await fetchUserProfile(firebaseUser.uid, firebaseUser);
      
      return firebaseUser;
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
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
    customClaims,
    loading,
    isAuthenticated,
    getUserType,
    isComplete: isComplete(),
    hasValidClaims: hasValidClaims(),
    login,
    logout: logoutUser,
    signIn,
    signUp,
    setUser,
    setUserProfile,
    setAcademia,
    setCustomClaims,
    fetchUserProfile,
    fetchAcademiaData,
    loadCustomClaims,
    refreshClaimsAndProfile,
    updateUserProfile,
    updateAcademiaAssociation,
    signInWithGoogle,
    signInWithFacebook,
    signInWithMicrosoft,
    signInWithApple
  };
};

export default useAuthMigration;
