import React from 'react';
import { getFinalUserType } from '../utils/userTypeHelpers';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { useAuth } from '../contexts/AuthProvider';
import { useTheme } from '../contexts/ThemeContext';

// Navegadores Modulares
import AuthNavigator from './AuthNavigator';
import StudentStackNavigator from './StudentNavigator';
import InstructorNavigator from './InstructorNavigator';
import AdminNavigator from './AdminNavigator';
import SharedNavigator from './SharedNavigator';

// Telas Especiais
import LoadingScreen from '../screens/shared/LoadingScreen';
import UserTypeSelectionScreen from '../screens/auth/UserTypeSelectionScreen';
import AcademiaSelectionScreen from '../screens/auth/AcademiaSelectionScreen';

const Stack = createStackNavigator();

// Navegação Principal (simplificada e modular)
const MainNavigator = ({ userType }) => {
  let TabNavigator;
  switch (userType) {
    case 'student':
      TabNavigator = StudentStackNavigator;
      break;
    case 'instructor':
      TabNavigator = InstructorNavigator;
      break;
    case 'admin':
      TabNavigator = AdminNavigator;
      break;
    default:
      TabNavigator = StudentStackNavigator;
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SharedScreens"
        children={() => <SharedNavigator userType={userType} />}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Navegador Principal da Aplicação
const AppNavigator = () => {
  const { user, userProfile, academia, loading } = useAuth();

  // Memoizar o estado para evitar re-renderizações desnecessárias
  const navigationState = React.useMemo(() => ({
    loading,
    hasUser: !!user,
    hasUserProfile: !!userProfile,
    hasAcademia: !!academia,
    userEmail: user?.email,
    tipo: userProfile?.tipo,
    userType: userProfile?.userType,
    finalUserType: userProfile?.userType || userProfile?.tipo || 'student',
    academiaId: userProfile?.academiaId
  }), [loading, user, userProfile, academia]);

  console.log('🧭 AppNavigator: Estado atual:', navigationState);
  console.log('🧭 AppNavigator: Loading:', loading);
  console.log('🧭 AppNavigator: User:', !!user);
  console.log('🧭 AppNavigator: UserProfile:', !!userProfile);
  console.log('🧭 AppNavigator: Academia:', !!academia);

  if (loading) {
    console.log('🧭 AppNavigator: Mostrando LoadingScreen - LOADING TRUE');
    return <LoadingScreen />;
  }

  // Se usuário não está logado, mostrar telas de autenticação
  if (!user) {
    console.log('🧭 AppNavigator: Renderizando AuthNavigator (usuário não logado)');
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  // Se usuário está logado mas não tem perfil, mostrar loading
  if (!userProfile) {
    console.log('🧭 AppNavigator: Carregando perfil do usuário...');
    return <LoadingScreen />;
  }

  // Se usuário não completou o perfil (tipo não definido), mostrar seleção de tipo
  // APENAS para usuários que realmente não têm tipo definido (novos usuários de login social)
  if ((!userProfile.userType && !userProfile.tipo) || userProfile.profileCompleted === false) {
    console.log('🧭 AppNavigator: Usuário sem tipo definido ou perfil incompleto, mostrando seleção de tipo');
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Se usuário não tem academia associada
  if (!userProfile.academiaId) {
    // Determinar tipo de usuário para decidir o fluxo
    const mappedUserType = getFinalUserType(userProfile);
    
    // Admins devem criar academia, outros usuários devem se associar
    if (mappedUserType === 'admin') {
      console.log('🧭 AppNavigator: Admin sem academia, redirecionando para criação');
      return (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen 
              name="AcademiaSelection" 
              component={AcademiaSelectionScreen}
              initialParams={{ forceCreate: true }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      );
    } else {
      console.log('🧭 AppNavigator: Usuário sem academia, mostrando seleção');
      return (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AcademiaSelection" component={AcademiaSelectionScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }
  }

  // Se tem academia mas dados não carregaram ainda, mostrar loading
  // EXCETO para admins que podem não ter academia ainda
  if (!academia && userProfile.academiaId) {
    console.log('🧭 AppNavigator: Carregando dados da academia...');
    return <LoadingScreen />;
  }
  
  // Se é admin sem academia, permitir acesso ao app para criar academia
  if (!academia && !userProfile.academiaId) {
    const mappedUserType = getFinalUserType(userProfile);
    
    if (mappedUserType === 'admin') {
      console.log('🧭 AppNavigator: Admin sem academia, permitindo acesso ao app principal');
      // Permitir acesso ao app principal para admins sem academia
    }
  }

  // Determinar tipo de usuário final (normalizado)
  const userType = getFinalUserType(userProfile);
  
  // Usuário completo com academia, mostrar app principal
  console.log('🧭 AppNavigator: Renderizando MainNavigator para:', userType, {
    tipo: userProfile.tipo,
    userType: userProfile.userType,
    finalUserType: userType,
    academiaId: userProfile.academiaId,
    academiaName: academia?.nome
  });
  
  return (
    <NavigationContainer>
      <MainNavigator userType={userType} />
    </NavigationContainer>
  );
};

export default AppNavigator;