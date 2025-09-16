// Professional color palettes for different user types
export const PROFESSIONAL_COLORS = {
  // Admin Theme - Deep Purple/Violet (Authority & Management)
  admin: {
    primary: '#6A1B9A',
    secondary: '#8E24AA',
    accent: '#AB47BC',
    gradient: ['#6A1B9A', '#8E24AA', '#AB47BC'],
    surface: '#F3E5F5',
    background: '#FAFAFA',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#424242',
    success: '#2E7D32',
    warning: '#F57C00',
    error: '#C62828',
  },

  // Instructor Theme - Professional Blue (Trust & Knowledge)
  instructor: {
    primary: '#1565C0',
    secondary: '#1976D2',
    accent: '#2196F3',
    gradient: ['#1565C0', '#1976D2', '#2196F3'],
    surface: '#E3F2FD',
    background: '#FAFAFA',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#424242',
    success: '#2E7D32',
    warning: '#F57C00',
    error: '#C62828',
  },

  // Student Theme - Energetic Green (Growth & Progress)
  student: {
    primary: '#2E7D32',
    secondary: '#388E3C',
    accent: '#4CAF50',
    gradient: ['#2E7D32', '#388E3C', '#4CAF50'],
    surface: '#E8F5E8',
    background: '#FAFAFA',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#424242',
    success: '#2E7D32',
    warning: '#F57C00',
    error: '#C62828',
  },

  // Common colors used across all themes
  common: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    status: {
      success: '#2E7D32',
      warning: '#F57C00',
      error: '#C62828',
      info: '#1976D2',
    }
  }
};

// Function to get theme colors based on user type
export const getThemeColors = (userType) => {
  switch (userType) {
    case 'admin':
    case 'administrador':
      return PROFESSIONAL_COLORS.admin;
    case 'instructor':
    case 'instrutor':
      return PROFESSIONAL_COLORS.instructor;
    case 'student':
    case 'aluno':
      return PROFESSIONAL_COLORS.student;
    default:
      return PROFESSIONAL_COLORS.student; // Default to student theme
  }
};

// Header gradients for each user type
export const HEADER_GRADIENTS = {
  admin: ['#6A1B9A', '#8E24AA', '#AB47BC'],
  instructor: ['#1565C0', '#1976D2', '#2196F3'],
  student: ['#2E7D32', '#388E3C', '#4CAF50'],
};

// Status colors for various states
export const STATUS_COLORS = {
  active: '#4CAF50',
  inactive: '#9E9E9E',
  pending: '#FF9800',
  overdue: '#F44336',
  paid: '#4CAF50',
  cancelled: '#F44336',
};

// Elevation shadows for cards and surfaces
export const ELEVATION = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Typography scale
export const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: 'bold', lineHeight: 40 },
  h2: { fontSize: 28, fontWeight: 'bold', lineHeight: 36 },
  h3: { fontSize: 24, fontWeight: 'bold', lineHeight: 32 },
  h4: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h5: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  h6: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  body1: { fontSize: 16, fontWeight: 'normal', lineHeight: 24 },
  body2: { fontSize: 14, fontWeight: 'normal', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: 'normal', lineHeight: 16 },
  button: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
};

// Spacing scale
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius scale
export const BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
  round: 50,
};
