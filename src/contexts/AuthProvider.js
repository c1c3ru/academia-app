import React from 'react';
import useAuthMigration from '../hooks/useAuthMigration';

// Provider de compatibilidade para migração gradual
export const AuthProvider = ({ children }) => {
  // Inicializar o hook de migração para configurar listeners
  useAuthMigration();
  
  // Simplesmente renderizar os children, o estado agora é gerenciado pelo Zustand
  return children;
};

// Hook de compatibilidade que usa o Zustand store
export const useAuth = () => {
  return useAuthMigration();
};

export default AuthProvider;
