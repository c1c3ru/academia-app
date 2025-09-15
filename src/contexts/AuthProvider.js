import React, { createContext, useContext } from 'react';
import useAuthMigration from '../hooks/useAuthMigration';

// Criar contexto para compartilhar o estado
const AuthContext = createContext();

// Provider de compatibilidade para migração gradual
export const AuthProvider = ({ children }) => {
  // Usar o hook uma única vez e compartilhar o estado via contexto
  const authState = useAuthMigration();
  
  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook de compatibilidade que usa o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthProvider;
