import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente para proteger rotas que exigem autenticação e associação com academia
 * @param {React.Component} component - Componente a ser renderizado se autorizado
 * @param {string[]} roles - Roles permitidas (admin, instrutor, aluno)
 * @param {boolean} requireAcademia - Se requer associação com academia
 * @param {object} props - Outras props
 */
export function ProtectedRoute({ 
  component: Component, 
  roles = [], 
  requireAcademia = true,
  redirectTo = null,
  ...props 
}) {
  const { user, userProfile, academia, loading } = useAuth();

  // Mostrar loading enquanto carrega dados de autenticação
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  // Verificar se usuário está logado
  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.errorTitle}>
              Acesso Negado
            </Text>
            <Text variant="bodyMedium" style={styles.errorMessage}>
              Você precisa estar logado para acessar esta página.
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  // Verificar se perfil do usuário foi carregado
  if (!userProfile) {
    return (
      <View style={styles.errorContainer}>
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.errorTitle}>
              Perfil Não Encontrado
            </Text>
            <Text variant="bodyMedium" style={styles.errorMessage}>
              Não foi possível carregar seu perfil. Tente fazer login novamente.
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  // Verificar roles se especificadas
  if (roles.length > 0 && !roles.includes(userProfile.tipo)) {
    return (
      <View style={styles.errorContainer}>
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.errorTitle}>
              Permissão Insuficiente
            </Text>
            <Text variant="bodyMedium" style={styles.errorMessage}>
              Você não tem permissão para acessar esta página.
            </Text>
            <Text variant="bodySmall" style={styles.errorDetails}>
              Seu tipo: {userProfile.tipo}
            </Text>
            <Text variant="bodySmall" style={styles.errorDetails}>
              Tipos permitidos: {roles.join(', ')}
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  // Verificar associação com academia se requerida
  if (requireAcademia && !userProfile.academiaId) {
    return (
      <View style={styles.errorContainer}>
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.errorTitle}>
              Academia Não Associada
            </Text>
            <Text variant="bodyMedium" style={styles.errorMessage}>
              Você precisa estar associado a uma academia para acessar esta página.
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  // Verificar se dados da academia foram carregados (se requerido)
  if (requireAcademia && userProfile.academiaId && !academia) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Carregando dados da academia...</Text>
      </View>
    );
  }

  // Se passou por todas as verificações, renderizar o componente
  return <Component {...props} />;
}

/**
 * HOC (Higher Order Component) para proteger componentes
 */
export function withProtectedRoute(Component, options = {}) {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute 
        component={Component} 
        {...options}
        {...props}
      />
    );
  };
}

/**
 * Hook para verificar permissões dentro de componentes
 */
export function usePermissions() {
  const { userProfile, academia } = useAuth();

  const hasRole = (role) => {
    return userProfile?.tipo === role;
  };

  const hasAnyRole = (roles) => {
    return roles.some(role => hasRole(role));
  };

  const isAdmin = () => hasRole('admin');
  const isInstructor = () => hasRole('instrutor');
  const isStudent = () => hasRole('aluno');

  const canManageStudents = () => hasAnyRole(['admin', 'instrutor']);
  const canManageClasses = () => hasAnyRole(['admin', 'instrutor']);
  const canManagePayments = () => hasRole('admin');
  const canManageInstructors = () => hasRole('admin');
  const canManageAcademia = () => hasRole('admin');

  const hasAcademiaAccess = () => {
    return userProfile?.academiaId && academia;
  };

  return {
    userProfile,
    academia,
    hasRole,
    hasAnyRole,
    isAdmin,
    isInstructor,
    isStudent,
    canManageStudents,
    canManageClasses,
    canManagePayments,
    canManageInstructors,
    canManageAcademia,
    hasAcademiaAccess
  };
}

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    width: '100%',
    maxWidth: 400,
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#d32f2f',
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetails: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 4,
  },
};
