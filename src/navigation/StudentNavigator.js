import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import UniversalHeader from '../components/UniversalHeader';

// Telas do Aluno
import StudentDashboard from '../screens/student/StudentDashboard';
import StudentPayments from '../screens/student/StudentPayments';
import StudentEvolution from '../screens/student/StudentEvolution';
import StudentCalendar from '../screens/student/StudentCalendar';

const Tab = createBottomTabNavigator();

// Navegação para Alunos
const StudentNavigator = () => {
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

export default StudentNavigator;
