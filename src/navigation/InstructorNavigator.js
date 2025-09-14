import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import UniversalHeader from '../components/UniversalHeader';

// Telas do Professor
import InstructorDashboard from '../screens/instructor/InstructorDashboard';
import InstructorClasses from '../screens/instructor/InstructorClasses';
import InstructorStudents from '../screens/instructor/InstructorStudents';
import NovaAula from '../screens/instructor/NovaAula';
import CheckIn from '../screens/instructor/CheckIn';
import Relatorios from '../screens/instructor/Relatorios';

// Telas Compartilhadas
import ClassDetailsScreen from '../screens/shared/ClassDetailsScreen';
import AddClassScreen from '../screens/admin/AddClassScreen';
import AddStudentScreen from '../screens/admin/AddStudentScreen';
import StudentProfileScreen from '../screens/shared/StudentProfileScreen';
import AddGraduationScreen from '../screens/shared/AddGraduationScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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

// Stack Navigator para Instrutor (para incluir telas modais)
const InstructorNavigator = () => {
  const { getString } = useTheme();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InstructorTabs" component={InstructorTabNavigator} />
      <Stack.Screen 
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
      <Stack.Screen 
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
      <Stack.Screen 
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
      <Stack.Screen 
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
      <Stack.Screen 
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
      <Stack.Screen 
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
      <Stack.Screen 
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
      <Stack.Screen 
        name="StudentProfile" 
        component={StudentProfileScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title="Perfil do Aluno"
              navigation={navigation}
              showBack={true}
              backgroundColor="#4CAF50"
            />
          ),
        }}
      />
      <Stack.Screen 
        name="AddGraduation" 
        component={AddGraduationScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title="Nova Graduação"
              navigation={navigation}
              showBack={true}
              backgroundColor="#4CAF50"
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

export default InstructorNavigator;
