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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 AuthStateChanged: Firebase user mudou:', firebaseUser?.email || 'null');
      
      if (firebaseUser) {
        console.log('🔐 AuthStateChanged: Usuário logado, definindo user state');
        setUser(firebaseUser);
        // Buscar perfil do usuário no Firestore
        await fetchUserProfile(firebaseUser.uid);
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

  const fetchUserProfile = async (userId) => {
    try {
      // Primeiro tenta buscar na nova estrutura 'usuarios'
      let userDoc = await getDoc(doc(db, 'usuarios', userId));
      
      // Se não encontrar, tenta na estrutura legacy 'users'
      if (!userDoc.exists()) {
        userDoc = await getDoc(doc(db, 'users', userId));
      }
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
        
        // Se o usuário tem academiaId, buscar dados da academia
        if (userData.academiaId) {
          await fetchAcademiaData(userData.academiaId);
        } else {
          setAcademia(null);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
    }
  };

  const fetchAcademiaData = async (academiaId) => {
    try {
      const academiaDoc = await getDoc(doc(db, 'academias', academiaId));
      if (academiaDoc.exists()) {
        setAcademia({
          id: academiaId,
          ...academiaDoc.data()
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados da academia:', error);
    }
  };

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
      if (user) {
        // Atualizar na nova estrutura 'usuarios'
        await setDoc(doc(db, 'usuarios', user.uid), {
          ...userProfile,
          ...updates,
          updatedAt: new Date()
        }, { merge: true });
        
        await fetchUserProfile(user.uid);
      }
    } catch (error) {
      throw error;
    }
  };

  const updateAcademiaAssociation = async (academiaId) => {
    try {
      if (user) {
        await updateUserProfile({ academiaId });
        await fetchAcademiaData(academiaId);
      }
    } catch (error) {
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

