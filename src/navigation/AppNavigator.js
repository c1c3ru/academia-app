import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';

import { useAuth } from '../contexts/AuthContext';
import UniversalHeader from '../components/UniversalHeader';

// Telas de Autenticação
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Telas do Aluno
import StudentDashboard from '../screens/student/StudentDashboard';
import StudentPayments from '../screens/student/StudentPayments';
import StudentEvolution from '../screens/student/StudentEvolution';
import StudentCalendar from '../screens/student/StudentCalendar';

// Telas do Professor
import InstructorDashboard from '../screens/instructor/InstructorDashboard';
import InstructorClasses from '../screens/instructor/InstructorClasses';
import InstructorStudents from '../screens/instructor/InstructorStudents';
import NovaAula from '../screens/instructor/NovaAula';
import CheckIn from '../screens/instructor/CheckIn';
import Relatorios from '../screens/instructor/Relatorios';

// Telas do Admin
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminStudents from '../screens/admin/AdminStudents';
import AdminClasses from '../screens/admin/AdminClasses';
import AdminModalities from '../screens/admin/AdminModalities';
import AddClassScreen from '../screens/admin/AddClassScreen';
import EditClassScreen from '../screens/admin/EditClassScreen';
import AddStudentScreen from '../screens/admin/AddStudentScreen';
import EditStudentScreen from '../screens/admin/EditStudentScreen';
import ReportsScreen from '../screens/admin/ReportsScreen';

// Telas Compartilhadas
import ProfileScreen from '../screens/shared/ProfileScreen';
import LoadingScreen from '../screens/shared/LoadingScreen';
import ClassDetailsScreen from '../screens/shared/ClassDetailsScreen';
import StudentDetailsScreen from '../screens/shared/StudentDetailsScreen';

const Stack = createStackNavigator();

// Stack Navigator para Admin (para telas modais/detalhes)
const AdminStack = createStackNavigator();

const AdminStackNavigator = () => (
  <AdminStack.Navigator screenOptions={{ headerShown: false }}>
    <AdminStack.Screen name="AdminTabs" component={AdminTabNavigator} />
    <AdminStack.Screen 
      name="AddClass" 
      component={AddClassScreen}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title="Nova Turma"
            navigation={navigation}
            showBack={true}
            backgroundColor="#FF9800"
          />
        ),
      }}
    />
    <AdminStack.Screen 
      name="EditClass" 
      component={EditClassScreen}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title="Editar Turma"
            navigation={navigation}
            showBack={true}
            backgroundColor="#FF9800"
          />
        ),
      }}
    />
    <AdminStack.Screen 
      name="ClassDetails" 
      component={ClassDetailsScreen}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title="Detalhes da Turma"
            navigation={navigation}
            showBack={true}
            backgroundColor="#FF9800"
          />
        ),
      }}
    />
    <AdminStack.Screen 
      name="AddStudent" 
      component={AddStudentScreen}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title="Novo Aluno"
            navigation={navigation}
            showBack={true}
            backgroundColor="#FF9800"
          />
        ),
      }}
    />
    <AdminStack.Screen 
      name="EditStudent" 
      component={EditStudentScreen}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title="Editar Aluno"
            navigation={navigation}
            showBack={true}
            backgroundColor="#FF9800"
          />
        ),
      }}
    />
    <AdminStack.Screen 
      name="StudentDetails" 
      component={StudentDetailsScreen}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title="Detalhes do Aluno"
            navigation={navigation}
            showBack={true}
            backgroundColor="#FF9800"
          />
        ),
      }}
    />
    <AdminStack.Screen 
      name="StudentPayments" 
      component={StudentPayments}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title="Pagamentos do Aluno"
            navigation={navigation}
            showBack={true}
            backgroundColor="#FF9800"
          />
        ),
      }}
    />
    <AdminStack.Screen 
      name="Reports" 
      component={ReportsScreen}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title="Relatórios"
            navigation={navigation}
            showBack={true}
            backgroundColor="#FF9800"
          />
        ),
      }}
    />
  </AdminStack.Navigator>
);
const Tab = createBottomTabNavigator();

// Navegação para Alunos
const StudentTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route, navigation }) => ({
      header: ({ options, route: hdrRoute, navigation: hdrNav }) => (
        <UniversalHeader
          title={(options && options.title) || (hdrRoute && hdrRoute.name) || route.name || 'Academia'}
          navigation={hdrNav || navigation}
          backgroundColor="#2196F3"
        />
      ),
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Pagamentos') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Evolução') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Calendário') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={StudentDashboard}
      options={{ title: 'Painel do Aluno' }}
    />
    <Tab.Screen 
      name="Pagamentos" 
      component={StudentPayments}
      options={{ title: 'Pagamentos' }}
    />
    <Tab.Screen 
      name="Evolução" 
      component={StudentEvolution}
      options={{ title: 'Minha Evolução' }}
    />
    <Tab.Screen 
      name="Calendário" 
      component={StudentCalendar}
      options={{ title: 'Calendário de Aulas' }}
    />
  </Tab.Navigator>
);

// Stack Navigator para Instrutor (para incluir telas modais)
const InstructorStack = createStackNavigator();

const InstructorStackNavigator = () => (
  <InstructorStack.Navigator screenOptions={{ headerShown: false }}>
    <InstructorStack.Screen name="InstructorTabs" component={InstructorTabNavigator} />
    <InstructorStack.Screen 
      name="NovaAula" 
      component={NovaAula}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title="Nova Aula"
            navigation={navigation}
            showBack={true}
            backgroundColor="#4CAF50"
          />
        ),
      }}
    />
    <InstructorStack.Screen 
      name="CheckIn" 
      component={CheckIn}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title="Check-in"
            navigation={navigation}
            showBack={true}
            backgroundColor="#4CAF50"
          />
        ),
      }}
    />
    <InstructorStack.Screen 
      name="Relatorios" 
      component={Relatorios}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title="Relatórios"
            navigation={navigation}
            showBack={true}
            backgroundColor="#4CAF50"
          />
        ),
      }}
    />
  </InstructorStack.Navigator>
);

// Navegação para Professores
const InstructorTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route, navigation }) => ({
      header: ({ options, route: hdrRoute, navigation: hdrNav }) => (
        <UniversalHeader
          title={(options && options.title) || (hdrRoute && hdrRoute.name) || route.name || 'Instrutor'}
          navigation={hdrNav || navigation}
          backgroundColor="#4CAF50"
        />
      ),
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Turmas') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Alunos') {
            iconName = focused ? 'people' : 'people-outline';
          }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={InstructorDashboard}
      options={{ title: 'Painel do Instrutor' }}
    />
    <Tab.Screen 
      name="Turmas" 
      component={InstructorClasses}
      options={{ title: 'Minhas Turmas' }}
    />
    <Tab.Screen 
      name="Alunos" 
      component={InstructorStudents}
      options={{ title: 'Meus Alunos' }}
    />
  </Tab.Navigator>
);

// Navegação para Administradores
const AdminTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route, navigation }) => ({
      header: ({ options, route: hdrRoute, navigation: hdrNav }) => (
        <UniversalHeader
          title={(options && options.title) || (hdrRoute && hdrRoute.name) || route.name || 'Admin'}
          navigation={hdrNav || navigation}
          backgroundColor="#FF9800"
        />
      ),
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Alunos') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Turmas') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Gestão') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FF9800',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={AdminDashboard}
      options={{ title: 'Painel Administrativo' }}
    />
    <Tab.Screen 
      name="Alunos" 
      component={AdminStudents}
      options={{ title: 'Gerenciar Alunos' }}
    />
    <Tab.Screen 
      name="Turmas" 
      component={AdminClasses}
      options={{ title: 'Gerenciar Turmas' }}
    />
    <Tab.Screen 
      name="Gestão" 
      component={AdminModalities}
      options={{ title: 'Configurações' }}
    />
  </Tab.Navigator>
);

// Navegação de Autenticação
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// Navegação Principal (simplificada: apenas Stack + Tabs)
const MainNavigator = ({ userType }) => {
  let TabNavigator;
  switch (userType) {
    case 'student':
      TabNavigator = StudentTabNavigator;
      break;
    case 'instructor':
      TabNavigator = InstructorStackNavigator;
      break;
    case 'admin':
      TabNavigator = AdminStackNavigator;
      break;
    default:
      TabNavigator = StudentTabNavigator;
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title="Meu Perfil"
              subtitle="Informações pessoais e configurações"
              navigation={navigation}
              showBack={true}
              backgroundColor={
                userType === 'admin' ? '#FF9800' :
                userType === 'instructor' ? '#4CAF50' : '#2196F3'
              }
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
};

// Navegador Principal da Aplicação
const AppNavigator = () => {
  const { user, userProfile, loading } = useAuth();

  console.log('🧭 AppNavigator: Estado atual:', {
    loading,
    hasUser: !!user,
    hasUserProfile: !!userProfile,
    userEmail: user?.email,
    userType: userProfile?.userType
  });

  if (loading) {
    console.log('🧭 AppNavigator: Mostrando LoadingScreen');
    return <LoadingScreen />;
  }

  if (user && userProfile) {
    console.log('🧭 AppNavigator: Renderizando MainNavigator para:', userProfile.userType);
    return (
      <NavigationContainer>
        <MainNavigator userType={userProfile.userType} />
      </NavigationContainer>
    );
  } else {
    console.log('🧭 AppNavigator: Renderizando AuthNavigator (usuário não logado)');
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }
};

export default AppNavigator;