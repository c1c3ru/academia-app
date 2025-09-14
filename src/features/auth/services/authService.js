import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../services/firebase';
import useAuthStore from '../../../stores/authStore';

class AuthService {
  // Login com email e senha
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Buscar perfil do usuário
      const userProfile = await this.getUserProfile(user.uid);
      
      // Atualizar store
      const { login } = useAuthStore.getState();
      login(user, userProfile);
      
      return { user, userProfile };
    } catch (error) {
      console.error('❌ AuthService.login:', error);
      throw this.handleAuthError(error);
    }
  }

  // Registro de novo usuário
  async register(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Criar perfil do usuário no Firestore
      const userProfile = {
        id: user.uid,
        email: user.email,
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'usuarios', user.uid), userProfile);
      
      // Atualizar store
      const { login } = useAuthStore.getState();
      login(user, userProfile);
      
      return { user, userProfile };
    } catch (error) {
      console.error('❌ AuthService.register:', error);
      throw this.handleAuthError(error);
    }
  }

  // Reset de senha
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Email de reset enviado com sucesso' };
    } catch (error) {
      console.error('❌ AuthService.resetPassword:', error);
      throw this.handleAuthError(error);
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth);
      const { logout } = useAuthStore.getState();
      logout();
      return { success: true };
    } catch (error) {
      console.error('❌ AuthService.logout:', error);
      throw this.handleAuthError(error);
    }
  }

  // Buscar perfil do usuário
  async getUserProfile(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', userId));
      if (userDoc.exists()) {
        return { id: userId, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('❌ AuthService.getUserProfile:', error);
      throw error;
    }
  }

  // Atualizar perfil do usuário
  async updateUserProfile(userId, updates) {
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'usuarios', userId), updatedData, { merge: true });
      
      // Atualizar store
      const { updateProfile } = useAuthStore.getState();
      updateProfile(updatedData);
      
      return updatedData;
    } catch (error) {
      console.error('❌ AuthService.updateUserProfile:', error);
      throw error;
    }
  }

  // Tratamento de erros do Firebase Auth
  handleAuthError(error) {
    const errorMessages = {
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Email já está em uso',
      'auth/weak-password': 'Senha muito fraca',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Usuário desabilitado',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
      'auth/network-request-failed': 'Erro de conexão'
    };

    const message = errorMessages[error.code] || error.message || 'Erro desconhecido';
    
    return {
      code: error.code,
      message,
      originalError: error
    };
  }

  // Verificar se usuário está logado
  getCurrentUser() {
    return auth.currentUser;
  }

  // Verificar estado de autenticação
  isAuthenticated() {
    const { isAuthenticated } = useAuthStore.getState();
    return isAuthenticated;
  }
}

export default new AuthService();
