import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { IconButton } from 'react-native-paper';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

// Telas de Autenticação
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Telas do Aluno
import StudentDashboard from '../screens/student/StudentDashboard';
import StudentPayments from '../screens/student/StudentPayments';
import StudentEvolution from '../screens/student/StudentEvolution';
import StudentCalendar from '../screens/student/StudentCalendar';

// Telas do Professor
import InstructorDashboard from '../screens/instructor/InstructorDashboard';
import InstructorClasses from '../screens/instructor/InstructorClasses';
import InstructorStudents from '../screens/instructor/InstructorStudents';

// Telas do Admin
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminStudents from '../screens/admin/AdminStudents';
import AdminClasses from '../screens/admin/AdminClasses';
import AdminModalities from '../screens/admin/AdminModalities';

// Telas Compartilhadas
import ProfileScreen from '../screens/shared/ProfileScreen';
import LoadingScreen from '../screens/shared/LoadingScreen';
import ClassDetailsScreen from '../screens/shared/ClassDetailsScreen';
import StudentDetailsScreen from '../screens/shared/StudentDetailsScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';
import AddClassScreen from '../screens/admin/AddClassScreen';
import AddStudentScreen from '../screens/admin/AddStudentScreen';
import EditClassScreen from '../screens/admin/EditClassScreen';
import EditStudentScreen from '../screens/admin/EditStudentScreen';
import ReportsScreen from '../screens/admin/ReportsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Componente do botão de logout para o header
const LogoutButton = () => {
  const { logout } = useAuth();
  
  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível fazer logout');
            }
          }
        }
      ]
    );
  };

  return (
    <IconButton
      icon="logout"
      iconColor="#fff"
      size={24}
      onPress={handleLogout}
    />
  );
};

// Navegação para Alunos
const StudentTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
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
    <Tab.Screen name="Dashboard" component={StudentDashboard} />
    <Tab.Screen name="Pagamentos" component={StudentPayments} />
    <Tab.Screen name="Evolução" component={StudentEvolution} />
    <Tab.Screen name="Calendário" component={StudentCalendar} />
  </Tab.Navigator>
);

// Navegação para Professores
const InstructorTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
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
    <Tab.Screen name="Dashboard" component={InstructorDashboard} />
    <Tab.Screen name="Turmas" component={InstructorClasses} />
    <Tab.Screen name="Alunos" component={InstructorStudents} />
  </Tab.Navigator>
);

// Navegação para Administradores
const AdminTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
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
    <Tab.Screen name="Dashboard" component={AdminDashboard} />
    <Tab.Screen name="Alunos" component={AdminStudents} />
    <Tab.Screen name="Turmas" component={AdminClasses} />
    <Tab.Screen name="Gestão" component={AdminModalities} />
  </Tab.Navigator>
);

// Navegação de Autenticação
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Navegação Principal
const MainNavigator = ({ userType }) => {
  let TabNavigator;

  switch (userType) {
    case 'student':
      TabNavigator = StudentTabNavigator;
      break;
    case 'instructor':
      TabNavigator = InstructorTabNavigator;
      break;
    case 'admin':
      TabNavigator = AdminTabNavigator;
      break;
    default:
      TabNavigator = StudentTabNavigator;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{
          headerShown: true,
          title: 'Academia App',
          headerRight: () => <LogoutButton />
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'Perfil',
          headerRight: () => <LogoutButton />
        }}
      />
      
      {/* Telas de Detalhes */}
      <Stack.Screen 
        name="ClassDetails" 
        component={ClassDetailsScreen}
        options={{ 
          title: 'Detalhes da Turma',
          headerRight: () => <LogoutButton />
        }}
      />
      <Stack.Screen 
        name="StudentDetails" 
        component={StudentDetailsScreen}
        options={{ 
          title: 'Detalhes do Aluno',
          headerRight: () => <LogoutButton />
        }}
      />
      <Stack.Screen 
        name="StudentProfile" 
        component={StudentDetailsScreen}
        options={{ 
          title: 'Perfil do Aluno',
          headerRight: () => <LogoutButton />
        }}
      />
      
      {/* Telas de Gestão */}
      <Stack.Screen 
        name="CheckIns" 
        component={LoadingScreen} // Temporário
        options={{ 
          title: 'Check-ins',
          headerRight: () => <LogoutButton />
        }}
      />
      <Stack.Screen 
        name="AddGraduation" 
        component={LoadingScreen} // Temporário
        options={{ 
          title: 'Adicionar Graduação',
          headerRight: () => <LogoutButton />
        }}
      />
      <Stack.Screen 
        name="AddClass" 
        component={AddClassScreen}
        options={{ 
          title: 'Adicionar Turma',
          headerRight: () => <LogoutButton />
        }}
      />
      <Stack.Screen 
        name="EditClass" 
        component={EditClassScreen}
        options={{ 
          title: 'Editar Turma',
          headerRight: () => <LogoutButton />
        }}
      />
      <Stack.Screen 
        name="AddStudent" 
        component={AddStudentScreen}
        options={{ 
          title: 'Adicionar Aluno',
          headerRight: () => <LogoutButton />
        }}
      />
      <Stack.Screen 
        name="EditStudent" 
        component={EditStudentScreen}
        options={{ 
          title: 'Editar Aluno',
          headerRight: () => <LogoutButton />
        }}
      />
      
      {/* Telas de Relatórios e Configurações */}
      <Stack.Screen 
        name="Relatórios" 
        component={ReportsScreen}
        options={{ 
          title: 'Relatórios',
          headerRight: () => <LogoutButton />
        }}
      />
      <Stack.Screen 
        name="Configurações" 
        component={SettingsScreen}
        options={{ 
          title: 'Configurações',
          headerRight: () => <LogoutButton />
        }}
      />
      <Stack.Screen 
        name="AdminSettings" 
        component={SettingsScreen}
        options={{ title: 'Configurações Admin' }}
      />
      
      {/* Telas Específicas */}
      <Stack.Screen 
        name="StudentAnnouncements" 
        component={LoadingScreen} // Temporário
        options={{ title: 'Avisos' }}
      />
      <Stack.Screen 
        name="ClassStudents" 
        component={LoadingScreen} // Temporário
        options={{ title: 'Alunos da Turma' }}
      />
    </Stack.Navigator>
  );
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

