import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import UniversalHeader from '../components/UniversalHeader';

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
import ClassDetailsScreen from '../screens/shared/ClassDetailsScreen';
import StudentDetailsScreen from '../screens/shared/StudentDetailsScreen';
import StudentProfileScreen from '../screens/shared/StudentProfileScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import AddGraduationScreen from '../screens/shared/AddGraduationScreen';
import StudentPayments from '../screens/student/StudentPayments';
import CheckIn from '../screens/instructor/CheckIn';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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

// Stack Navigator para Admin (para telas modais/detalhes)
const AdminNavigator = () => {
  const { getString } = useTheme();
  
  return (
    <Stack.Navigator id="AdminStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
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
              backgroundColor="#FF9800"
            />
          ),
        }}
      />
      <Stack.Screen 
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
      <Stack.Screen 
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
      <Stack.Screen 
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
              backgroundColor="#FF9800"
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
              backgroundColor="#FF9800"
            />
          ),
        }}
      />
      <Stack.Screen 
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
      <Stack.Screen 
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
      <Stack.Screen 
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
      <Stack.Screen 
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
              backgroundColor="#FF9800"
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
              backgroundColor="#FF9800"
            />
          ),
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title="Perfil"
              navigation={navigation}
              showBack={true}
              backgroundColor="#FF9800"
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
