// Constantes da aplicação

export const USER_TYPES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin'
};

export const GRADUATIONS = [
  'Iniciante',
  'Branca',
  'Azul',
  'Roxa',
  'Marrom',
  'Preta',
  'Coral',
  'Vermelha',
  'Vermelha e Preta'
];

export const MODALITIES = [
  'Jiu-Jitsu',
  'Muay Thai',
  'MMA',
  'Boxe',
  'Wrestling',
  'Judo'
];

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

export const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'bank_transfer', label: 'Transferência Bancária' }
];

export const CLASS_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

export const COLORS = {
  PRIMARY: '#2196F3',
  SECONDARY: '#4CAF50',
  ERROR: '#F44336',
  WARNING: '#FF9800',
  SUCCESS: '#4CAF50',
  INFO: '#2196F3',
  BACKGROUND: '#f5f5f5',
  SURFACE: '#ffffff',
  TEXT: '#333333',
  TEXT_SECONDARY: '#666666'
};

export const GRADUATION_COLORS = {
  'Iniciante': '#9E9E9E',
  'Branca': '#FFFFFF',
  'Azul': '#2196F3',
  'Roxa': '#9C27B0',
  'Marrom': '#795548',
  'Preta': '#000000',
  'Coral': '#FF5722',
  'Vermelha': '#F44336',
  'Vermelha e Preta': '#B71C1C'
};

export const NOTIFICATION_TYPES = {
  CLASS_REMINDER: 'class_reminder',
  PAYMENT_DUE: 'payment_due',
  GRADUATION: 'graduation',
  ANNOUNCEMENT: 'announcement',
  CHECK_IN: 'check_in'
};

export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  TIME: 'HH:mm',
  DATETIME: 'DD/MM/YYYY HH:mm'
};

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  PHONE_REGEX: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  CPF_LENGTH: 11
};

export const LIMITS = {
  MAX_CLASS_CAPACITY: 50,
  MIN_AGE: 5,
  MAX_AGE: 120,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_CLASSES_PER_STUDENT: 10
};

export const STORAGE_KEYS = {
  USER_TOKEN: '@academia_app:user_token',
  USER_PROFILE: '@academia_app:user_profile',
  THEME_PREFERENCE: '@academia_app:theme',
  NOTIFICATION_SETTINGS: '@academia_app:notifications'
};

export default {
  USER_TYPES,
  GRADUATIONS,
  MODALITIES,
  DAYS_OF_WEEK,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  CLASS_STATUS,
  COLORS,
  GRADUATION_COLORS,
  NOTIFICATION_TYPES,
  DATE_FORMATS,
  VALIDATION_RULES,
  LIMITS,
  STORAGE_KEYS
};
