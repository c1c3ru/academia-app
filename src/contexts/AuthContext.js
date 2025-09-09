import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [academia, setAcademia] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const fetchUserProfile = async (userId) => {
    try {
      console.log('🔍 fetchUserProfile: Buscando perfil para userId:', userId);
      
      // Primeiro tenta buscar na nova estrutura 'usuarios'
      console.log('🔍 fetchUserProfile: Tentando buscar em usuarios...');
      let userDoc = await getDoc(doc(db, 'usuarios', userId));
      let foundIn = null;
      
      if (userDoc.exists()) {
        foundIn = 'usuarios';
        console.log('✅ fetchUserProfile: Encontrado em usuarios');
      } else {
        console.log('❌ fetchUserProfile: Não encontrado em usuarios, tentando users...');
        // Se não encontrar, tenta na estrutura legacy 'users'
        userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          foundIn = 'users';
          console.log('✅ fetchUserProfile: Encontrado em users (legacy)');
        }
      }
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('📊 fetchUserProfile: Dados do usuário carregados:', {
          email: userData.email,
          academiaId: userData.academiaId,
          tipo: userData.tipo,
          userType: userData.userType,
          foundIn: foundIn,
          hasAcademiaId: !!userData.academiaId
        });
        
        setUserProfile(userData);
        
        // Se o usuário tem academiaId, buscar dados da academia
        if (userData.academiaId) {
          console.log('🏢 fetchUserProfile: Usuário tem academiaId, buscando dados da academia...');
          await fetchAcademiaData(userData.academiaId);
        } else {
          console.log('⚠️ fetchUserProfile: Usuário SEM academiaId - será redirecionado para seleção');
          setAcademia(null);
        }
      } else {
        console.log('❌ fetchUserProfile: Usuário não encontrado em nenhuma coleção');
        setUserProfile(null);
        setAcademia(null);
      }
    } catch (error) {
      console.error('❌ fetchUserProfile: Erro ao buscar perfil do usuário:', error);
      console.error('❌ fetchUserProfile: Detalhes:', {
        userId,
        code: error.code,
        message: error.message
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 AuthStateChanged: Firebase user mudou:', firebaseUser?.email || 'null');
      
      if (firebaseUser) {
        console.log('🔐 AuthStateChanged: Usuário logado, definindo user state');
        setUser(firebaseUser);
        
        // TESTE: Verificar se fetchUserProfile existe
        console.log('🔐 AuthStateChanged: fetchUserProfile existe?', typeof fetchUserProfile);
        
        // Buscar perfil do usuário no Firestore
        console.log('🔐 AuthStateChanged: Chamando fetchUserProfile para UID:', firebaseUser.uid);
        
        // Chamada direta com log imediato
        console.log('🔐 AuthStateChanged: ANTES de chamar fetchUserProfile');
        try {
          await fetchUserProfile(firebaseUser.uid);
          console.log('🔐 AuthStateChanged: fetchUserProfile concluído');
        } catch (error) {
          console.error('🔐 AuthStateChanged: Erro no fetchUserProfile:', error);
        }
        console.log('🔐 AuthStateChanged: DEPOIS de chamar fetchUserProfile');
      } else {
        console.log('🔐 AuthContext: Usuário deslogado, limpando estados');
        setUser(null);
        setUserProfile(null);
        setAcademia(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password, userData) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Criar perfil do usuário na nova estrutura 'usuarios'
      await setDoc(doc(db, 'usuarios', firebaseUser.uid), {
        ...userData,
        email,
        tipo: userData.tipo || 'aluno', // Padrão para aluno
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await fetchUserProfile(firebaseUser.uid);
      return firebaseUser;
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('🔐 Tentando login com:', { 
        email: email, 
        emailType: typeof email,
        emailLength: email ? email.length : 0,
        password: password ? '***' : 'undefined',
        passwordType: typeof password,
        passwordLength: password ? password.length : 0
      });
      console.log('📧 Email válido:', email && email.includes('@'));
      console.log('📧 Email trim:', email ? email.trim() : 'undefined');
      console.log('🔑 Senha trim:', password ? password.trim() : 'undefined');
      
      // Limpar e validar dados
      const cleanEmail = email ? email.trim().toLowerCase() : '';
      const cleanPassword = password ? password.trim() : '';
      
      console.log('🧹 Dados limpos:', {
        email: cleanEmail,
        password: cleanPassword ? '***' : 'undefined'
      });
      
      if (!cleanEmail || !cleanPassword) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      console.log('✅ Login bem-sucedido:', firebaseUser.email);
      
      await fetchUserProfile(firebaseUser.uid);
      return firebaseUser;
    } catch (error) {
      console.error('❌ Erro detalhado no login:', {
        code: error.code,
        message: error.message,
        email: email,
        emailType: typeof email,
        passwordLength: password ? password.length : 0,
        passwordType: typeof password,
        stack: error.stack
      });
      throw error;
    }
  };

  const signInWithGoogle = async (googleCredential) => {
    try {
      const credential = GoogleAuthProvider.credential(googleCredential);
      const { user: firebaseUser } = await signInWithCredential(auth, credential);
      
      // Verificar se o usuário já existe no Firestore (nova estrutura)
      let userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
      
      // Se não existir na nova estrutura, verificar na legacy
      if (!userDoc.exists()) {
        userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      }
      
      if (!userDoc.exists()) {
        // Criar perfil básico para usuário do Google na nova estrutura
        await setDoc(doc(db, 'usuarios', firebaseUser.uid), {
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          tipo: 'aluno', // Padrão para novos usuários
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      await fetchUserProfile(firebaseUser.uid);
      return firebaseUser;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🔐 AuthContext: Iniciando signOut do Firebase...');
      console.log('🔐 AuthContext: User atual antes do logout:', user?.email);
      console.log('🔐 AuthContext: Auth object:', auth);
      
      await signOut(auth);
      console.log('🔐 AuthContext: SignOut executado com sucesso');
      
      console.log('🔐 AuthContext: Limpando estados locais...');
      setUser(null);
      setUserProfile(null);
      setAcademia(null);
      
      console.log('🔐 AuthContext: Logout completo - estados limpos');
    } catch (error) {
      console.error('🔐 AuthContext: Erro no signOut:', error);
      console.error('🔐 AuthContext: Detalhes do erro:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      console.log('📝 updateUserProfile: Iniciando atualização do perfil');
      console.log('📝 updateUserProfile: Updates:', updates);
      console.log('📝 updateUserProfile: User UID:', user?.uid);
      console.log('📝 updateUserProfile: UserProfile atual:', {
        email: userProfile?.email,
        academiaId: userProfile?.academiaId,
        tipo: userProfile?.tipo
      });
      
      if (user) {
        const updateData = {
          ...userProfile,
          ...updates,
          updatedAt: new Date()
        };
        
        console.log('📝 updateUserProfile: Dados finais para salvar:', {
          email: updateData.email,
          academiaId: updateData.academiaId,
          tipo: updateData.tipo,
          updatedAt: updateData.updatedAt
        });
        
        // Atualizar na nova estrutura 'usuarios'
        console.log('📝 updateUserProfile: Salvando em usuarios...');
        await setDoc(doc(db, 'usuarios', user.uid), updateData, { merge: true });
        console.log('✅ updateUserProfile: Salvo com sucesso em usuarios');
        
        console.log('📝 updateUserProfile: Recarregando perfil...');
        await fetchUserProfile(user.uid);
        console.log('✅ updateUserProfile: Perfil recarregado');
      } else {
        console.error('❌ updateUserProfile: Usuário não está logado');
      }
    } catch (error) {
      console.error('❌ updateUserProfile: Erro na atualização:', error);
      console.error('❌ updateUserProfile: Detalhes:', {
        userId: user?.uid,
        updates,
        code: error.code,
        message: error.message
      });
      throw error;
    }
  };

  const updateAcademiaAssociation = async (academiaId) => {
    try {
      console.log('🔗 updateAcademiaAssociation: Iniciando associação com academia:', academiaId);
      console.log('🔗 updateAcademiaAssociation: User UID:', user?.uid);
      console.log('🔗 updateAcademiaAssociation: User email:', user?.email);
      
      if (user) {
        console.log('🔗 updateAcademiaAssociation: Atualizando perfil do usuário...');
        await updateUserProfile({ academiaId });
        console.log('✅ updateAcademiaAssociation: Perfil atualizado com sucesso');
        
        console.log('🔗 updateAcademiaAssociation: Buscando dados da academia...');
        await fetchAcademiaData(academiaId);
        console.log('✅ updateAcademiaAssociation: Associação completa!');
      } else {
        console.error('❌ updateAcademiaAssociation: Usuário não está logado');
      }
    } catch (error) {
      console.error('❌ updateAcademiaAssociation: Erro na associação:', error);
      console.error('❌ updateAcademiaAssociation: Detalhes:', {
        academiaId,
        userId: user?.uid,
        code: error.code,
        message: error.message
      });
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    academia,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    updateUserProfile,
    updateAcademiaAssociation,
    fetchUserProfile,
    fetchAcademiaData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

