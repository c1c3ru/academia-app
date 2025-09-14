// Feature: Admin
// Exportações centralizadas para o módulo de administração

// Screens
export { default as AdminDashboardSimple } from './screens/AdminDashboardSimple';
export { default as AdminStudents } from './screens/AdminStudents';
export { default as AdminClasses } from './screens/AdminClasses';
export { default as AdminModalities } from './screens/AdminModalities';
export { default as AddClassScreen } from './screens/AddClassScreen';
export { default as EditClassScreen } from './screens/EditClassScreen';
export { default as AddStudentScreen } from './screens/AddStudentScreen';
export { default as EditStudentScreen } from './screens/EditStudentScreen';
export { default as ReportsScreen } from './screens/ReportsScreen';
export { default as InviteManagement } from './screens/InviteManagement';

// Components
export { default as AdminCard } from './components/AdminCard';
export { default as UserManagement } from './components/UserManagement';
export { default as ReportsChart } from './components/ReportsChart';

// Services
export { default as adminService } from './services/adminService';

// Hooks
export { useAdminData } from './hooks/useAdminData';
