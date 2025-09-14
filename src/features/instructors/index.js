// Feature: Instructors
// Exportações centralizadas para o módulo de instrutores

// Screens
export { default as InstructorDashboard } from './screens/InstructorDashboard';
export { default as InstructorClasses } from './screens/InstructorClasses';
export { default as InstructorStudents } from './screens/InstructorStudents';
export { default as NovaAula } from './screens/NovaAula';
export { default as CheckIn } from './screens/CheckIn';
export { default as Relatorios } from './screens/Relatorios';

// Components
export { default as ClassCard } from './components/ClassCard';
export { default as CheckInButton } from './components/CheckInButton';
export { default as StudentList } from './components/StudentList';

// Services
export { default as instructorService } from './services/instructorService';

// Hooks
export { useInstructorData } from './hooks/useInstructorData';
