import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import UniversalHeader from '../components/UniversalHeader';

// Telas de Autenticação
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import UserTypeSelectionScreen from '../screens/auth/UserTypeSelectionScreen';
import AcademiaSelectionScreen from '../screens/auth/AcademiaSelectionScreen';

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
import InviteManagement from '../screens/admin/InviteManagement';

// Telas Compartilhadas
import ProfileScreen from '../screens/shared/ProfileScreen';
import ChangePasswordScreen from '../screens/shared/ChangePasswordScreen';
import PhysicalEvaluationScreen from '../screens/shared/PhysicalEvaluationScreen';
import PhysicalEvaluationHistoryScreen from '../screens/shared/PhysicalEvaluationHistoryScreen';
import InjuryScreen from '../screens/shared/InjuryScreen';
import InjuryHistoryScreen from '../screens/shared/InjuryHistoryScreen';
import PrivacyPolicyScreen from '../screens/shared/PrivacyPolicyScreen';
import NotificationSettingsScreen from '../screens/shared/NotificationSettingsScreen';
import PrivacySettingsScreen from '../screens/shared/PrivacySettingsScreen';
import LoadingScreen from '../screens/shared/LoadingScreen';
import ClassDetailsScreen from '../screens/shared/ClassDetailsScreen';
import StudentDetailsScreen from '../screens/shared/StudentDetailsScreen';

const Stack = createStackNavigator();

// Stack Navigator para Admin (para telas modais/detalhes)
const AdminStack = createStackNavigator();

const AdminStackNavigator = () => {
  const { getString } = useTheme();
  
  return (
  <AdminStack.Navigator id="AdminStack" screenOptions={{ headerShown: false }}>
    <AdminStack.Screen name="AdminTabs" component={AdminTabNavigator} />
    <AdminStack.Screen 
      name="AddClass" 
      component={AddClassScreen}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title={getString('newClass')}
            navigation={navigation}
            showBack={true}
            backgroundColor="#FF9800"
          />
        ),
      }}
    />
    <AdminStack.Screen 
      name="ClassStudents" 
      component={AdminStudents}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title={getString('classStudents')}
            navigation={navigation}
            showBack={true}
            backgroundColor="#FF9800"
          />
        ),
      }}
    />
    <AdminStack.Screen 
      name="CheckIns" 
      component={CheckIn}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title="Check-ins"
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
            title={getString('editClass')}
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
            title={getString('classDetails')}
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
            title={getString('newStudent')}
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
            title={getString('editStudent')}
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
            title={getString('studentDetails')}
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
            title={getString('studentPayments')}
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
            title={getString('reports')}
            navigation={navigation}
            showBack={true}
            backgroundColor="#FF9800"
          />
        ),
      }}
    />
  </AdminStack.Navigator>
  );
};
const Tab = createBottomTabNavigator();

// Navegação para Alunos
const StudentTabNavigator = () => {
  const { getString } = useTheme();
  
  return (
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
      options={{ title: getString('studentDashboard') }}
    />
    <Tab.Screen 
      name="Pagamentos" 
      component={StudentPayments}
      options={{ title: getString('payments') }}
    />
    <Tab.Screen 
      name="Evolução" 
      component={StudentEvolution}
      options={{ title: getString('evolution') }}
    />
    <Tab.Screen 
      name="Calendário" 
      component={StudentCalendar}
      options={{ title: getString('calendar') }}
    />
  </Tab.Navigator>
  );
};

// Stack Navigator para Instrutor (para incluir telas modais)
const InstructorStack = createStackNavigator();

const InstructorStackNavigator = () => {
  const { getString } = useTheme();
  
  return (
  <InstructorStack.Navigator screenOptions={{ headerShown: false }}>
    <InstructorStack.Screen name="InstructorTabs" component={InstructorTabNavigator} />
    <InstructorStack.Screen 
      name="NovaAula" 
      component={NovaAula}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title={getString('newLesson')}
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
            title={getString('checkIn')}
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
            title={getString('reports')}
            navigation={navigation}
            showBack={true}
            backgroundColor="#4CAF50"
          />
        ),
      }}
    />
    <InstructorStack.Screen 
      name="ClassDetails" 
      component={ClassDetailsScreen}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title={getString('classDetails')}
            navigation={navigation}
            showBack={true}
            backgroundColor="#4CAF50"
          />
        ),
      }}
    />
    <InstructorStack.Screen 
      name="CheckIns" 
      component={CheckIn}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title={getString('checkIns')}
            navigation={navigation}
            showBack={true}
            backgroundColor="#4CAF50"
          />
        ),
      }}
    />
    <InstructorStack.Screen 
      name="AddClass" 
      component={AddClassScreen}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title={getString('newClass')}
            navigation={navigation}
            showBack={true}
            backgroundColor="#4CAF50"
          />
        ),
      }}
    />
    <InstructorStack.Screen 
      name="AddStudent" 
      component={AddStudentScreen}
      options={{
        headerShown: true,
        header: ({ navigation }) => (
          <UniversalHeader
            title={getString('newStudent')}
            navigation={navigation}
            showBack={true}
            backgroundColor="#4CAF50"
          />
        ),
      }}
    />
  </InstructorStack.Navigator>
  );
};

// Navegação para Professores
const InstructorTabNavigator = () => {
  const { getString } = useTheme();
  
  return (
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
      options={{ title: getString('dashboard') }}
    />
    <Tab.Screen 
      name="Turmas" 
      component={InstructorClasses}
      options={{ title: getString('classes') }}
    />
    <Tab.Screen 
      name="Alunos" 
      component={InstructorStudents}
      options={{ title: getString('students') }}
    />
  </Tab.Navigator>
  );
};

// Navegação para Administradores
const AdminTabNavigator = () => {
  const { getString } = useTheme();
  
  return (
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
          } else if (route.name === 'Convites') {
            iconName = focused ? 'mail' : 'mail-outline';
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
      options={{ title: getString('dashboard') }}
    />
    <Tab.Screen 
      name="Alunos" 
      component={AdminStudents}
      options={{ title: getString('students') }}
    />
    <Tab.Screen 
      name="Turmas" 
      component={AdminClasses}
      options={{ title: getString('classes') }}
    />
    <Tab.Screen 
      name="Gestão" 
      component={AdminModalities}
      options={{ title: getString('modalities') }}
    />
    <Tab.Screen 
      name="Convites" 
      component={InviteManagement}
      options={{ title: getString('invites') }}
    />
  </Tab.Navigator>
  );
};

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
      <Stack.Screen name="AcademiaSelection" component={AcademiaSelectionScreen} />
    </Stack.Navigator>
  );
};

// Navegação Principal (simplificada: apenas Stack + Tabs)
const MainNavigator = ({ userType }) => {
  const { getString } = useTheme();
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
              title={getString('myProfile')}
              subtitle={getString('personalInfoAndSettings')}
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
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title={getString('changePassword')}
              subtitle={getString('updateYourPassword')}
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
      <Stack.Screen
        name="PhysicalEvaluation"
        component={PhysicalEvaluationScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title={getString('physicalEvaluation')}
              subtitle={getString('recordBodyMeasurements')}
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
      <Stack.Screen
        name="PhysicalEvaluationHistory"
        component={PhysicalEvaluationHistoryScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title={getString('evaluationHistory')}
              subtitle={getString('trackPhysicalEvolution')}
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
      <Stack.Screen
        name="Injury"
        component={InjuryScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title={getString('manageInjury')}
              subtitle={getString('recordAndTrackInjuries')}
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
      <Stack.Screen
        name="InjuryHistory"
        component={InjuryHistoryScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title={getString('myInjuries')}
              subtitle={getString('injuryHistoryAndRecovery')}
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
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title={getString('privacyPolicy')}
              subtitle={getString('dataProtectionAndLGPD')}
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
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title={getString('notificationSettings')}
              subtitle={getString('manageYourNotifications')}
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
      <Stack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title={getString('privacySettings')}
              subtitle={getString('lgpdAndDataProtection')}
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
  const { user, userProfile, academia, loading } = useAuth();

  console.log('🧭 AppNavigator: Estado atual:', {
    loading,
    hasUser: !!user,
    hasUserProfile: !!userProfile,
    hasAcademia: !!academia,
    userEmail: user?.email,
    tipo: userProfile?.tipo,
    userType: userProfile?.userType,
    finalUserType: userProfile?.userType || userProfile?.tipo || 'student',
    academiaId: userProfile?.academiaId
  });

  if (loading) {
    console.log('🧭 AppNavigator: Mostrando LoadingScreen');
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
    const currentUserType = userProfile.userType || userProfile.tipo || 'student';
    const mappedUserType = currentUserType === 'administrador' ? 'admin' : 
                          currentUserType === 'instrutor' ? 'instructor' : 
                          currentUserType === 'aluno' ? 'student' : currentUserType;
    
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
  if (!academia) {
    console.log('🧭 AppNavigator: Carregando dados da academia...');
    return <LoadingScreen />;
  }

  // Determinar tipo de usuário (userType é o campo principal)
  let userType = userProfile.userType || userProfile.tipo || 'student';
  
  // Mapear valores em português para inglês para compatibilidade
  if (userType === 'instrutor') {
    userType = 'instructor';
  } else if (userType === 'aluno') {
    userType = 'student';
  } else if (userType === 'administrador') {
    userType = 'admin';
  }
  
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