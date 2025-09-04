import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
<<<<<<< Updated upstream
import { Platform } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
=======
import { IconButton } from 'react-native-paper';
>>>>>>> Stashed changes

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

// Telas Compartilhadas
import ProfileScreen from '../screens/shared/ProfileScreen';
import LoadingScreen from '../screens/shared/LoadingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Navegação para Alunos
<<<<<<< Updated upstream
const StudentTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route, navigation }) => ({
      header: ({ options }) => (
        <UniversalHeader
          title={options.title || route.name}
          navigation={navigation}
          backgroundColor="#2196F3"
        />
      ),
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
=======
const StudentTabNavigator = () => {
  const { logout } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
>>>>>>> Stashed changes

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Pagamentos') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Evolução') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Calendário') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }

<<<<<<< Updated upstream
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
=======
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerRight: () => (
          <IconButton
            icon="logout"
            size={22}
            onPress={logout}
            accessibilityLabel="Sair"
            style={{ marginRight: 8 }}
          />
        ),
        headerTitle: 'Academia',
      })}
    >
      <Tab.Screen name="Dashboard" component={StudentDashboard} />
      <Tab.Screen name="Pagamentos" component={StudentPayments} />
      <Tab.Screen name="Evolução" component={StudentEvolution} />
      <Tab.Screen name="Calendário" component={StudentCalendar} />
    </Tab.Navigator>
  );
};
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
const InstructorTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route, navigation }) => ({
      header: ({ options }) => (
        <UniversalHeader
          title={options.title || route.name}
          navigation={navigation}
          backgroundColor="#4CAF50"
        />
      ),
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
=======
const InstructorTabNavigator = () => {
  const { logout } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
>>>>>>> Stashed changes

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Turmas') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Alunos') {
            iconName = focused ? 'people' : 'people-outline';
          }

<<<<<<< Updated upstream
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
      header: ({ options }) => (
        <UniversalHeader
          title={options.title || route.name}
          navigation={navigation}
          backgroundColor="#FF9800"
        />
      ),
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
=======
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerRight: () => (
          <IconButton
            icon="logout"
            size={22}
            onPress={logout}
            accessibilityLabel="Sair"
            style={{ marginRight: 8 }}
          />
        ),
        headerTitle: 'Academia',
      })}
    >
      <Tab.Screen name="Dashboard" component={InstructorDashboard} />
      <Tab.Screen name="Turmas" component={InstructorClasses} />
      <Tab.Screen name="Alunos" component={InstructorStudents} />
    </Tab.Navigator>
  );
};

// Navegação para Administradores
const AdminTabNavigator = () => {
  const { logout } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
>>>>>>> Stashed changes

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Alunos') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Turmas') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Gestão') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

<<<<<<< Updated upstream
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
=======
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: 'gray',
        headerRight: () => (
          <IconButton
            icon="logout"
            size={22}
            onPress={logout}
            accessibilityLabel="Sair"
            style={{ marginRight: 8 }}
          />
        ),
        headerTitle: 'Painel Admin',
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Alunos" component={AdminStudents} />
      <Tab.Screen name="Turmas" component={AdminClasses} />
      <Tab.Screen name="Gestão" component={AdminModalities} />
    </Tab.Navigator>
  );
};
>>>>>>> Stashed changes

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

// Componente para usar responsividade dentro do navegador
const ResponsiveMainNavigator = ({ userType }) => {
  const { isMobile, isTablet } = useResponsive();

  let TabNavigator;
  switch (userType) {
    case 'student':
      TabNavigator = StudentTabNavigator;
      break;
    case 'instructor':
      TabNavigator = InstructorStackNavigator;
      break;
    case 'admin':
      TabNavigator = AdminTabNavigator;
      break;
    default:
      TabNavigator = StudentTabNavigator;
  }

<<<<<<< Updated upstream
  // Use drawer para tablets/desktop, tabs para mobile
  if (isMobile) {
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
  } else {
    // Para tablet/desktop, usar drawer navigation
    const DrawerNavigator = () => (
      <Drawer.Navigator
        screenOptions={({ navigation }) => ({
          drawerStyle: {
            backgroundColor: '#f5f5f5',
            width: 280,
          },
          header: ({ options, route }) => (
            <UniversalHeader
              title={options.title || route.name}
              navigation={navigation}
              backgroundColor={
                userType === 'admin' ? '#FF9800' :
                userType === 'instructor' ? '#4CAF50' : '#2196F3'
              }
            />
          ),
        })}
      >
        <Drawer.Screen
          name="Dashboard"
          component={TabNavigator}
          options={{
            title: 'Dashboard',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Meu Perfil',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            ),
          }}
        />
      </Drawer.Navigator>
    );

    return <DrawerNavigator />;
  }
};

// Navegação Principal
const MainNavigator = ({ userType }) => {
  return <ResponsiveMainNavigator userType={userType} />;
=======
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      {/* Rotas auxiliares para evitar erros de navegação a partir das telas de Admin */}
      <Stack.Screen 
        name="StudentDetails" 
        component={AdminStudents}
        options={{ title: 'Detalhes do Aluno' }}
      />
      <Stack.Screen 
        name="AddStudent" 
        component={AdminStudents}
        options={{ title: 'Novo Aluno' }}
      />
      <Stack.Screen 
        name="EditStudent" 
        component={AdminStudents}
        options={{ title: 'Editar Aluno' }}
      />
      <Stack.Screen 
        name="StudentPayments" 
        component={StudentPayments}
        options={{ title: 'Pagamentos do Aluno' }}
      />
      <Stack.Screen 
        name="ClassDetails" 
        component={AdminClasses}
        options={{ title: 'Detalhes da Turma' }}
      />
      <Stack.Screen 
        name="AddClass" 
        component={AdminClasses}
        options={{ title: 'Nova Turma' }}
      />
      <Stack.Screen 
        name="EditClass" 
        component={AdminClasses}
        options={{ title: 'Editar Turma' }}
      />
      <Stack.Screen 
        name="ClassStudents" 
        component={AdminClasses}
        options={{ title: 'Alunos da Turma' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
      {/* Adicionar outras telas modais aqui */}
    </Stack.Navigator>
  );
>>>>>>> Stashed changes
};

// Navegador Principal da Aplicação
const AppNavigator = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user && userProfile ? (
        <MainNavigator userType={userProfile.userType} />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;