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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Buscar perfil do usuário no Firestore
        await fetchUserProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      console.log('Iniciando cadastro:', { email, userData });
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Usuário criado no Firebase Auth:', firebaseUser.uid);
      
      // Criar perfil do usuário no Firestore
      const userProfile = {
        ...userData,
        email,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Salvando perfil no Firestore:', userProfile);
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      console.log('Perfil salvo com sucesso');

      await fetchUserProfile(firebaseUser.uid);
      console.log('Cadastro concluído com sucesso');
      return firebaseUser;
    } catch (error) {
      console.error('Erro detalhado no signUp:', error);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserProfile(firebaseUser.uid);
      return firebaseUser;
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async (googleCredential) => {
    try {
      const credential = GoogleAuthProvider.credential(googleCredential);
      const { user: firebaseUser } = await signInWithCredential(auth, credential);
      
      // Verificar se o usuário já existe no Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        // Criar perfil básico para usuário do Google
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          userType: 'student', // Padrão para novos usuários
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
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
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

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    updateUserProfile,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

