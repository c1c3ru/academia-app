
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    secondary: '#FF9800',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    text: '#212121',
    disabled: '#BDBDBD',
  },
  roundness: 8,
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#64B5F6',
    secondary: '#FFB74D',
    background: '#121212',
    surface: '#1E1E1E',
    error: '#CF6679',
    success: '#81C784',
    warning: '#FFB74D',
    text: '#FFFFFF',
    disabled: '#6D6D6D',
  },
  roundness: 8,
};

// Languages configuration
export const languages = {
  pt: {
    code: 'pt',
    name: 'Português',
    flag: '🇧🇷',
    strings: {
      // Login Screen
      appName: 'Academia App',
      welcome: 'Bem-vindo de volta!',
      email: 'Email',
      password: 'Senha',
      login: 'Entrar',
      forgotPassword: 'Esqueci minha senha',
      register: 'Criar conta',
      language: 'Idioma',
      darkMode: 'Modo escuro',
      error: 'Erro',
      fillAllFields: 'Por favor, preencha todos os campos',
      loginError: 'Erro no Login',
      checkCredentials: 'Verifique suas credenciais',
      userNotFound: 'Usuário não encontrado',
      wrongPassword: 'Senha incorreta',
      invalidCredentials: 'Email ou senha inválidos. Verifique seus dados e tente novamente.',
      invalidEmail: 'Email inválido',
      loggingIn: 'Fazendo login...',
      
      // Social Login
      orLoginWith: 'Ou entre com:',
      
      // Registration Screen
      createAccount: 'Criar Conta',
      fillDataToRegister: 'Preencha os dados para se cadastrar',
      personalData: 'Dados Pessoais',
      fullName: 'Nome Completo *',
      phoneWhatsApp: 'Telefone/WhatsApp',
      userType: 'Tipo de Usuário',
      passwordSection: 'Senha',
      confirmPassword: 'Confirmar Senha *',
      creatingAccount: 'Criando conta...',
      alreadyHaveAccount: 'Já tem uma conta?',
      signIn: 'Entrar',
      
      // User Types
      student: 'Aluno',
      instructor: 'Professor',
      administrator: 'Administrador',
      studentDescription: 'Acesso às aulas e evolução',
      instructorDescription: 'Gerenciar turmas e alunos',
      adminDescription: 'Controle total do sistema',
      
      // Validation Messages
      nameRequired: 'Nome é obrigatório',
      emailRequired: 'Email é obrigatório',
      passwordMinLength: 'Senha deve ter pelo menos 6 caracteres',
      passwordsMismatch: 'Senhas não coincidem',
      
      // Success and Error Messages
      accountCreatedSuccess: 'Conta criada com sucesso! 🎉',
      registrationError: 'Erro ao criar conta',
      emailAlreadyInUse: 'Este email já está em uso',
      weakPassword: 'Senha muito fraca',
      googleLoginError: 'Erro ao fazer login com Google',
      facebookLoginError: 'Erro ao fazer login com Facebook',
      microsoftLoginError: 'Erro ao fazer login com Microsoft',
      appleLoginError: 'Erro ao fazer login com Apple',
      
      // Common
      required: 'obrigatório',
      success: 'Sucesso',
      loading: 'Carregando...',
      save: 'Salvar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      delete: 'Excluir',
      edit: 'Editar',
      back: 'Voltar',
      next: 'Próximo',
      finish: 'Finalizar',
      yes: 'Sim',
      no: 'Não',
      ok: 'OK',
      
      // Fallback messages
      recoverPassword: 'Recuperar Senha',
      contactSupport: 'Entre em contato com o suporte para recuperar sua senha.',
      registrationDevelopment: 'Funcionalidade de cadastro em desenvolvimento',
      
      // Navigation and Menu
      dashboard: 'Dashboard',
      payments: 'Pagamentos',
      evolution: 'Evolução',
      calendar: 'Calendário',
      reports: 'Relatórios',
      classes: 'Turmas',
      students: 'Alunos',
      management: 'Gestão',
      invitations: 'Convites',
      settings: 'Configurações',
      profile: 'Perfil',
      notifications: 'Notificações',
      academy: 'Academia',
      
      // Form Labels and Placeholders
      selectOption: 'Selecione uma opção',
      typeNumber: 'Digite o número',
      academyCodeOrLink: 'Código da academia ou link completo',
      searchStudents: 'Buscar alunos...',
      searchClasses: 'Buscar turmas...',
      academyCode: 'Código da Academia',
      postalCode: 'CEP/Código Postal',
      number: 'Número',
      address: 'Endereço',
      emergencyContact: 'Contato de Emergência',
      medicalInformation: 'Informações Médicas',
      allergiesMedicationsConditions: 'Alergias, medicamentos, condições médicas...',
      birthDate: 'Data de Nascimento',
      birthDatePlaceholder: '01/01/1990',
      goals: 'Objetivos',
      goalsPlaceholder: 'Perda de peso, ganho de massa, condicionamento...',
      medicalConditions: 'Condições Médicas (opcional)',
      medicalConditionsPlaceholder: 'Informe alergias, lesões, medicamentos, etc.',
      emergencyPhone: 'Telefone de Emergência',
      addressOptional: 'Endereço (opcional)',
      
      // Physical Evaluation
      physicalEvaluations: 'Avaliações físicas',
      physicalEvaluation: 'Avaliação Física',
      myInjuries: 'Minhas Lesões',
      currentGraduation: 'Graduação Atual',
      startDate: 'Data de Início',
      evaluationNotes: 'Observações sobre a avaliação',
      evaluationNotesPlaceholder: 'Ex: Início de nova dieta, mudança no treino, etc.',
      
      // Injury Management
      injuryDescription: 'Descrição da Lesão',
      injuryDescriptionPlaceholder: 'Descreva como a lesão ocorreu, sintomas, etc.',
      treatment: 'Tratamento',
      treatmentPlaceholder: 'Ex: Fisioterapia, medicamentos, repouso...',
      medicalNotes: 'Observações Médicas',
      medicalNotesPlaceholder: 'Instruções do médico, diagnóstico...',
      recoveryTime: 'Tempo de Recuperação',
      recoveryTimePlaceholder: 'Ex: 2 semanas, 1 mês...',
      restrictions: 'Restrições',
      restrictionsPlaceholder: 'Ex: Não fazer força com o braço, evitar corrida...',
      
      // Class Management
      description: 'Descrição',
      descriptionOptional: 'Descrição (opcional)',
      maxStudents: 'Máximo de Alunos',
      schedule: 'Horário',
      scheduleExample: 'Ex: Segunda 19:00',
      scheduleDetailed: 'Horário (ex: Segunda-feira 08:00-09:00)',
      monthlyPrice: 'Preço Mensal (R$)',
      maxCapacity: 'Capacidade Máxima',
      className: 'Nome da Turma',
      
      // Student Management
      phoneNotInformed: 'Telefone não informado',
      disassociationReason: 'Motivo da desassociação *',
      disassociationReasonPlaceholder: 'Informe o motivo da desassociação (ex: inadimplência, solicitação do aluno, etc.)',
      minAge: 'Idade mín.',
      maxAge: 'Idade máx.',
      until: 'Até (AAAA-MM-DD)',
      
      // Payment and Dates
      dueDatePlaceholder: 'DD/MM/AAAA',
      
      // User Information
      user: 'Usuário',
      personalInformation: 'Informações pessoais e configurações',
      updatePassword: 'Atualizar sua senha de acesso',
      changePassword: 'Alterar Senha',
      bodyMeasurements: 'Registre suas medidas corporais',
      physicalEvolution: 'Acompanhe sua evolução física',
      
      // Evolution and Goals
      maintainFrequency: 'Manter frequência nas aulas',
      improveTechniques: 'Aperfeiçoar técnicas',
      nextGraduation: 'Próxima graduação',
      
      // Statistics
      thisMonth: 'Este mês',
      plusThisMonth: '+15 este mês',
      averageFrequency: 'Frequência Média',
      plusVsLastMonth: '+3% vs mês anterior',
      
      // Admin Actions
      quickActions: 'Ações Rápidas',
      modalitiesConfig: 'Configurar modalidades',
      preferencesManagement: 'Preferências e gestão',
      addGraduation: 'Adicionar Graduação',
      
      // Error Messages
      cannotLoadPayments: 'Não foi possível carregar os pagamentos',
      whatsappNotFound: 'Número do WhatsApp da academia não encontrado',
      cannotOpenWhatsapp: 'Não foi possível abrir o WhatsApp',
      logoutNotAvailable: 'Função de logout não está disponível. Recarregue o app.',
      cannotLogout: 'Não foi possível fazer logout. Tente novamente.',
      cannotLoadClasses: 'Não foi possível carregar as aulas',
      cannotUpdateProfile: 'Não foi possível atualizar o perfil',
      cannotDeleteClass: 'Não foi possível excluir a turma. Verifique suas permissões.',
      cannotLoadStudents: 'Não foi possível carregar os alunos',
      cannotDeleteStudent: 'Não foi possível excluir o aluno',
      invalidCode: 'Digite um código válido',
      cannotProcessCode: 'Não foi possível processar o código',
      invalidQRCode: 'QR Code inválido',
      invalidOrExpiredInvite: 'Convite inválido ou expirado',
      invalidLink: 'Link inválido',
      pleaseValidEmail: 'Por favor, digite um email válido',
      userDataNotFound: 'Dados de usuário ou aula não encontrados',
      cannotCopyLink: 'Não foi possível copiar o link',
      checkInTimeError: 'Check-in só pode ser feito 15 minutos antes ou depois do horário da aula',
      
      // Success Messages
      classDeletedSuccess: 'Turma excluída com sucesso',
      studentDeletedSuccess: 'Aluno excluído com sucesso',
      
      // Development Messages
      inDevelopment: 'Em Desenvolvimento',
      exportFeatureComingSoon: 'Funcionalidade de exportação será implementada em breve',
      featureComingSoon: 'Funcionalidade será implementada em breve',
      limitedInformation: 'Algumas informações podem estar limitadas. Tente novamente mais tarde.',
      adminOnlyFeature: 'Funcionalidade disponível apenas para administradores',
      
      // Alert Titles
      checkIn: 'Check-in',
      warning: 'Aviso',
      info: 'Info',
      mandatorySelection: 'Seleção Obrigatória',
      pleaseSelectUserType: 'Por favor, selecione o tipo de usuário.',
      cannotSaveUserType: 'Não foi possível salvar o tipo de usuário. Tente novamente.',
      
      // Notification Service
      congratsNewGraduation: 'Parabéns! Nova Graduação',
      newAnnouncement: 'Novo Anúncio',
      
      // Logout Confirmation
      confirmExit: 'Confirmar Saída',
      sureToLogout: 'Tem certeza que deseja sair da sua conta?',
      exit: 'Sair',
      
      // Payment Status
      paid: 'Pago',
      pending: 'Pendente',
      overdue: 'Atrasado',
      notInformed: 'Não informado',
      pixPayment: 'Pagamento PIX',
      pixFeatureComingSoon: 'Funcionalidade de pagamento PIX será implementada em breve',
      
      // Navigation Titles
      newClass: 'Nova Turma',
      classStudents: 'Alunos da Turma',
      editClass: 'Editar Turma',
      classDetails: 'Detalhes da Turma',
      checkIns: 'Check-ins',
      newStudent: 'Novo Aluno',
      editStudent: 'Editar Aluno',
      studentDetails: 'Detalhes do Aluno',
      studentPayments: 'Pagamentos do Aluno',
      reports: 'Relatórios',
      newLesson: 'Nova Aula',
      myProfile: 'Meu Perfil',
      changePassword: 'Alterar Senha',
      physicalEvaluation: 'Avaliação Física',
      evaluationHistory: 'Histórico de Avaliações',
      manageInjury: 'Gerenciar Lesão',
      myInjuries: 'Minhas Lesões',
      privacyPolicy: 'Política de Privacidade',
      notificationSettings: 'Configurações de Notificação',
      privacySettings: 'Configurações de Privacidade',
      
      // Navigation Subtitles
      personalInfoAndSettings: 'Informações pessoais e configurações',
      updateYourPassword: 'Atualizar sua senha de acesso',
      recordBodyMeasurements: 'Registre suas medidas corporais',
      trackPhysicalEvolution: 'Acompanhe sua evolução física',
      recordAndTrackInjuries: 'Registre e acompanhe lesões',
      injuryHistoryAndRecovery: 'Histórico de lesões e recuperação',
      dataProtectionAndLGPD: 'Proteção de dados e LGPD',
      manageYourNotifications: 'Gerencie suas notificações',
      lgpdAndDataProtection: 'LGPD e proteção de dados',
      
      // Tab Navigation
      dashboard: 'Painel',
      payments: 'Pagamentos',
      evolution: 'Evolução',
      calendar: 'Calendário',
      students: 'Alunos',
      classes: 'Turmas',
      modalities: 'Modalidades',
      checkIn: 'Check-in',
      instructorReports: 'Relatórios',
      lessons: 'Aulas',
      studentDashboard: 'Painel do Aluno',
      invites: 'Convites',
      
      // Language Detection
      language: 'pt',
    }
  },
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    strings: {
      // Login Screen
      appName: 'Academia App',
      welcome: 'Welcome back!',
      email: 'Email',
      password: 'Password',
      login: 'Login',
      forgotPassword: 'Forgot password',
      register: 'Create account',
      language: 'Language',
      darkMode: 'Dark mode',
      error: 'Error',
      fillAllFields: 'Please fill all fields',
      loginError: 'Login Error',
      checkCredentials: 'Check your credentials',
      userNotFound: 'User not found',
      wrongPassword: 'Wrong password',
      invalidCredentials: 'Invalid email or password. Please check your credentials and try again.',
      invalidEmail: 'Invalid email',
      loggingIn: 'Logging in...',
      
      // Social Login
      orLoginWith: 'Or sign in with:',
      
      // Registration Screen
      createAccount: 'Create Account',
      fillDataToRegister: 'Fill in the data to register',
      personalData: 'Personal Data',
      fullName: 'Full Name *',
      phoneWhatsApp: 'Phone/WhatsApp',
      userType: 'User Type',
      passwordSection: 'Password',
      confirmPassword: 'Confirm Password *',
      creatingAccount: 'Creating account...',
      alreadyHaveAccount: 'Already have an account?',
      signIn: 'Sign In',
      
      // User Types
      student: 'Student',
      instructor: 'Instructor',
      administrator: 'Administrator',
      studentDescription: 'Access to classes and progress',
      instructorDescription: 'Manage classes and students',
      adminDescription: 'Full system control',
      
      // Validation Messages
      nameRequired: 'Name is required',
      emailRequired: 'Email is required',
      passwordMinLength: 'Password must be at least 6 characters',
      passwordsMismatch: 'Passwords do not match',
      
      // Success and Error Messages
      accountCreatedSuccess: 'Account created successfully! 🎉',
      registrationError: 'Error creating account',
      emailAlreadyInUse: 'This email is already in use',
      weakPassword: 'Password too weak',
      googleLoginError: 'Error signing in with Google',
      facebookLoginError: 'Error signing in with Facebook',
      microsoftLoginError: 'Error signing in with Microsoft',
      appleLoginError: 'Error signing in with Apple',
      
      // Common
      required: 'required',
      success: 'Success',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      next: 'Next',
      finish: 'Finish',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      
      // Fallback messages
      recoverPassword: 'Recover Password',
      contactSupport: 'Please contact support to recover your password.',
      registrationDevelopment: 'Registration feature under development',
      
      // Navigation and Menu
      dashboard: 'Dashboard',
      payments: 'Payments',
      evolution: 'Evolution',
      calendar: 'Calendar',
      reports: 'Reports',
      classes: 'Classes',
      students: 'Students',
      management: 'Management',
      invitations: 'Invitations',
      settings: 'Settings',
      profile: 'Profile',
      notifications: 'Notifications',
      academy: 'Academy',
      
      // Form Labels and Placeholders
      selectOption: 'Select an option',
      typeNumber: 'Type the number',
      academyCodeOrLink: 'Academy code or complete link',
      searchStudents: 'Search students...',
      searchClasses: 'Search classes...',
      academyCode: 'Academy Code',
      postalCode: 'ZIP/Postal Code',
      number: 'Number',
      address: 'Address',
      emergencyContact: 'Emergency Contact',
      medicalInformation: 'Medical Information',
      allergiesMedicationsConditions: 'Allergies, medications, medical conditions...',
      birthDate: 'Birth Date',
      birthDatePlaceholder: '01/01/1990',
      goals: 'Goals',
      goalsPlaceholder: 'Weight loss, muscle gain, conditioning...',
      medicalConditions: 'Medical Conditions (optional)',
      medicalConditionsPlaceholder: 'Report allergies, injuries, medications, etc.',
      emergencyPhone: 'Emergency Phone',
      addressOptional: 'Address (optional)',
      
      // Physical Evaluation
      physicalEvaluations: 'Physical evaluations',
      physicalEvaluation: 'Physical Evaluation',
      myInjuries: 'My Injuries',
      currentGraduation: 'Current Graduation',
      startDate: 'Start Date',
      evaluationNotes: 'Evaluation notes',
      evaluationNotesPlaceholder: 'E.g.: New diet start, training change, etc.',
      
      // Injury Management
      injuryDescription: 'Injury Description',
      injuryDescriptionPlaceholder: 'Describe how the injury occurred, symptoms, etc.',
      treatment: 'Treatment',
      treatmentPlaceholder: 'E.g.: Physical therapy, medications, rest...',
      medicalNotes: 'Medical Notes',
      medicalNotesPlaceholder: 'Doctor instructions, diagnosis...',
      recoveryTime: 'Recovery Time',
      recoveryTimePlaceholder: 'E.g.: 2 weeks, 1 month...',
      restrictions: 'Restrictions',
      restrictionsPlaceholder: 'E.g.: No arm strength, avoid running...',
      
      // Class Management
      description: 'Description',
      descriptionOptional: 'Description (optional)',
      maxStudents: 'Maximum Students',
      schedule: 'Schedule',
      scheduleExample: 'E.g.: Monday 7:00 PM',
      scheduleDetailed: 'Schedule (e.g.: Monday 08:00-09:00)',
      monthlyPrice: 'Monthly Price ($)',
      maxCapacity: 'Maximum Capacity',
      className: 'Class Name',
      
      // Student Management
      phoneNotInformed: 'Phone not provided',
      disassociationReason: 'Reason for disassociation *',
      disassociationReasonPlaceholder: 'Provide reason for disassociation (e.g.: non-payment, student request, etc.)',
      minAge: 'Min age',
      maxAge: 'Max age',
      until: 'Until (YYYY-MM-DD)',
      
      // Payment and Dates
      dueDatePlaceholder: 'MM/DD/YYYY',
      
      // User Information
      user: 'User',
      personalInformation: 'Personal information and settings',
      updatePassword: 'Update your access password',
      changePassword: 'Change Password',
      bodyMeasurements: 'Record your body measurements',
      physicalEvolution: 'Track your physical evolution',
      
      // Evolution and Goals
      maintainFrequency: 'Maintain class attendance',
      improveTechniques: 'Improve techniques',
      nextGraduation: 'Next graduation',
      
      // Statistics
      thisMonth: 'This month',
      plusThisMonth: '+15 this month',
      averageFrequency: 'Average Frequency',
      plusVsLastMonth: '+3% vs last month',
      
      // Admin Actions
      quickActions: 'Quick Actions',
      modalitiesConfig: 'Configure modalities',
      preferencesManagement: 'Preferences and management',
      addGraduation: 'Add Graduation',
      
      // Error Messages
      cannotLoadPayments: 'Could not load payments',
      whatsappNotFound: 'Academy WhatsApp number not found',
      cannotOpenWhatsapp: 'Could not open WhatsApp',
      logoutNotAvailable: 'Logout function not available. Reload the app.',
      cannotLogout: 'Could not logout. Please try again.',
      cannotLoadClasses: 'Could not load classes',
      cannotUpdateProfile: 'Could not update profile',
      cannotDeleteClass: 'Could not delete class. Check your permissions.',
      cannotLoadStudents: 'Could not load students',
      cannotDeleteStudent: 'Could not delete student',
      invalidCode: 'Enter a valid code',
      cannotProcessCode: 'Could not process code',
      invalidQRCode: 'Invalid QR Code',
      invalidOrExpiredInvite: 'Invalid or expired invitation',
      invalidLink: 'Invalid link',
      pleaseValidEmail: 'Please enter a valid email',
      userDataNotFound: 'User or class data not found',
      cannotCopyLink: 'Could not copy link',
      checkInTimeError: 'Check-in can only be done 15 minutes before or after class time',
      
      // Success Messages
      classDeletedSuccess: 'Class deleted successfully',
      studentDeletedSuccess: 'Student deleted successfully',
      
      // Development Messages
      inDevelopment: 'Under Development',
      exportFeatureComingSoon: 'Export feature will be implemented soon',
      featureComingSoon: 'Feature will be implemented soon',
      limitedInformation: 'Some information may be limited. Please try again later.',
      adminOnlyFeature: 'Feature available only for administrators',
      
      // Alert Titles
      checkIn: 'Check-in',
      warning: 'Warning',
      info: 'Info',
      mandatorySelection: 'Mandatory Selection',
      pleaseSelectUserType: 'Please select the user type.',
      cannotSaveUserType: 'Could not save user type. Please try again.',
      
      // Notification Service
      congratsNewGraduation: 'Congratulations! New Graduation',
      newAnnouncement: 'New Announcement',
      
      // Logout Confirmation
      confirmExit: 'Confirm Exit',
      sureToLogout: 'Are you sure you want to logout?',
      exit: 'Exit',
      
      // Payment Status
      paid: 'Paid',
      pending: 'Pending',
      overdue: 'Overdue',
      notInformed: 'Not informed',
      pixPayment: 'PIX Payment',
      pixFeatureComingSoon: 'PIX payment feature will be implemented soon',
      
      // Navigation Titles
      newClass: 'New Class',
      classStudents: 'Class Students',
      editClass: 'Edit Class',
      classDetails: 'Class Details',
      checkIns: 'Check-ins',
      newStudent: 'New Student',
      editStudent: 'Edit Student',
      studentDetails: 'Student Details',
      studentPayments: 'Student Payments',
      reports: 'Reports',
      newLesson: 'New Lesson',
      myProfile: 'My Profile',
      changePassword: 'Change Password',
      physicalEvaluation: 'Physical Evaluation',
      evaluationHistory: 'Evaluation History',
      manageInjury: 'Manage Injury',
      myInjuries: 'My Injuries',
      privacyPolicy: 'Privacy Policy',
      notificationSettings: 'Notification Settings',
      privacySettings: 'Privacy Settings',
      
      // Navigation Subtitles
      personalInfoAndSettings: 'Personal information and settings',
      updateYourPassword: 'Update your access password',
      recordBodyMeasurements: 'Record your body measurements',
      trackPhysicalEvolution: 'Track your physical evolution',
      recordAndTrackInjuries: 'Record and track injuries',
      injuryHistoryAndRecovery: 'Injury history and recovery',
      dataProtectionAndLGPD: 'Data protection and LGPD',
      manageYourNotifications: 'Manage your notifications',
      lgpdAndDataProtection: 'LGPD and data protection',
      
      // Tab Navigation
      dashboard: 'Dashboard',
      payments: 'Payments',
      evolution: 'Evolution',
      calendar: 'Calendar',
      students: 'Students',
      classes: 'Classes',
      modalities: 'Modalities',
      checkIn: 'Check-in',
      instructorReports: 'Reports',
      lessons: 'Lessons',
      studentDashboard: 'Student Dashboard',
      invites: 'Invites',
      
      // Language Detection
      language: 'en',
    }
  },
  es: {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
    strings: {
      // Login Screen
      appName: 'Academia App',
      welcome: '¡Bienvenido de vuelta!',
      email: 'Correo electrónico',
      password: 'Contraseña',
      login: 'Iniciar sesión',
      forgotPassword: 'Olvidé mi contraseña',
      register: 'Crear cuenta',
      language: 'Idioma',
      darkMode: 'Modo oscuro',
      error: 'Error',
      fillAllFields: 'Por favor, completa todos los campos',
      loginError: 'Error de inicio de sesión',
      checkCredentials: 'Verifica tus credenciales',
      userNotFound: 'Usuario no encontrado',
      wrongPassword: 'Contraseña incorrecta',
      invalidCredentials: 'Email o contraseña inválidos. Verifique sus datos e intente de nuevo.',
      invalidEmail: 'Correo electrónico inválido',
      loggingIn: 'Iniciando sesión...',
      
      // Social Login
      orLoginWith: 'O inicia sesión con:',
      
      // Registration Screen
      createAccount: 'Crear Cuenta',
      fillDataToRegister: 'Completa los datos para registrarte',
      personalData: 'Datos Personales',
      fullName: 'Nombre Completo *',
      phoneWhatsApp: 'Teléfono/WhatsApp',
      userType: 'Tipo de Usuario',
      passwordSection: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña *',
      creatingAccount: 'Creando cuenta...',
      alreadyHaveAccount: '¿Ya tienes una cuenta?',
      signIn: 'Iniciar Sesión',
      
      // User Types
      student: 'Estudiante',
      instructor: 'Instructor',
      administrator: 'Administrador',
      studentDescription: 'Acceso a clases y progreso',
      instructorDescription: 'Gestionar clases y estudiantes',
      adminDescription: 'Control total del sistema',
      
      // Validation Messages
      nameRequired: 'El nombre es obligatorio',
      emailRequired: 'El correo electrónico es obligatorio',
      passwordMinLength: 'La contraseña debe tener al menos 6 caracteres',
      passwordsMismatch: 'Las contraseñas no coinciden',
      
      // Success and Error Messages
      accountCreatedSuccess: '¡Cuenta creada exitosamente! 🎉',
      registrationError: 'Error al crear la cuenta',
      emailAlreadyInUse: 'Este correo electrónico ya está en uso',
      weakPassword: 'Contraseña muy débil',
      googleLoginError: 'Error al iniciar sesión con Google',
      facebookLoginError: 'Error al iniciar sesión con Facebook',
      microsoftLoginError: 'Error al iniciar sesión con Microsoft',
      appleLoginError: 'Error al iniciar sesión con Apple',
      
      // Common
      required: 'obligatorio',
      success: 'Éxito',
      loading: 'Cargando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      delete: 'Eliminar',
      edit: 'Editar',
      back: 'Atrás',
      next: 'Siguiente',
      finish: 'Finalizar',
      yes: 'Sí',
      no: 'No',
      ok: 'OK',
      
      // Fallback messages
      recoverPassword: 'Recuperar Contraseña',
      contactSupport: 'Por favor contacta a soporte para recuperar tu contraseña.',
      registrationDevelopment: 'Funcionalidad de registro en desarrollo',
      
      // Navigation and Menu
      dashboard: 'Dashboard',
      payments: 'Pagos',
      evolution: 'Evolución',
      calendar: 'Calendario',
      reports: 'Reportes',
      classes: 'Clases',
      students: 'Estudiantes',
      management: 'Gestión',
      invitations: 'Invitaciones',
      settings: 'Configuraciones',
      profile: 'Perfil',
      notifications: 'Notificaciones',
      academy: 'Academia',
      
      // Form Labels and Placeholders
      selectOption: 'Selecciona una opción',
      typeNumber: 'Digite el número',
      academyCodeOrLink: 'Código de la academia o enlace completo',
      searchStudents: 'Buscar estudiantes...',
      searchClasses: 'Buscar clases...',
      academyCode: 'Código de la Academia',
      postalCode: 'Código Postal',
      number: 'Número',
      address: 'Dirección',
      emergencyContact: 'Contacto de Emergencia',
      medicalInformation: 'Información Médica',
      allergiesMedicationsConditions: 'Alergias, medicamentos, condiciones médicas...',
      birthDate: 'Fecha de Nacimiento',
      birthDatePlaceholder: '01/01/1990',
      goals: 'Objetivos',
      goalsPlaceholder: 'Pérdida de peso, ganancia muscular, acondicionamiento...',
      medicalConditions: 'Condiciones Médicas (opcional)',
      medicalConditionsPlaceholder: 'Informa alergias, lesiones, medicamentos, etc.',
      emergencyPhone: 'Teléfono de Emergencia',
      addressOptional: 'Dirección (opcional)',
      
      // Physical Evaluation
      physicalEvaluations: 'Evaluaciones físicas',
      physicalEvaluation: 'Evaluación Física',
      myInjuries: 'Mis Lesiones',
      currentGraduation: 'Graduación Actual',
      startDate: 'Fecha de Inicio',
      evaluationNotes: 'Notas de evaluación',
      evaluationNotesPlaceholder: 'Ej.: Inicio de nueva dieta, cambio de entrenamiento, etc.',
      
      // Injury Management
      injuryDescription: 'Descripción de la Lesión',
      injuryDescriptionPlaceholder: 'Describe cómo ocurrió la lesión, síntomas, etc.',
      treatment: 'Tratamiento',
      treatmentPlaceholder: 'Ej.: Fisioterapia, medicamentos, reposo...',
      medicalNotes: 'Notas Médicas',
      medicalNotesPlaceholder: 'Instrucciones del médico, diagnóstico...',
      recoveryTime: 'Tiempo de Recuperación',
      recoveryTimePlaceholder: 'Ej.: 2 semanas, 1 mes...',
      restrictions: 'Restricciones',
      restrictionsPlaceholder: 'Ej.: No hacer fuerza con el brazo, evitar correr...',
      
      // Class Management
      description: 'Descripción',
      descriptionOptional: 'Descripción (opcional)',
      maxStudents: 'Máximo de Estudiantes',
      schedule: 'Horario',
      scheduleExample: 'Ej.: Lunes 19:00',
      scheduleDetailed: 'Horario (ej.: Lunes 08:00-09:00)',
      monthlyPrice: 'Precio Mensual ($)',
      maxCapacity: 'Capacidad Máxima',
      className: 'Nombre de la Clase',
      
      // Student Management
      phoneNotInformed: 'Teléfono no informado',
      disassociationReason: 'Motivo de desasociación *',
      disassociationReasonPlaceholder: 'Proporciona el motivo de desasociación (ej.: impago, solicitud del estudiante, etc.)',
      minAge: 'Edad mín.',
      maxAge: 'Edad máx.',
      until: 'Hasta (AAAA-MM-DD)',
      
      // Payment and Dates
      dueDatePlaceholder: 'DD/MM/AAAA',
      
      // User Information
      user: 'Usuario',
      personalInformation: 'Información personal y configuraciones',
      updatePassword: 'Actualiza tu contraseña de acceso',
      changePassword: 'Cambiar Contraseña',
      bodyMeasurements: 'Registra tus medidas corporales',
      physicalEvolution: 'Sigue tu evolución física',
      
      // Evolution and Goals
      maintainFrequency: 'Mantener frecuencia en clases',
      improveTechniques: 'Perfeccionar técnicas',
      nextGraduation: 'Próxima graduación',
      
      // Statistics
      thisMonth: 'Este mes',
      plusThisMonth: '+15 este mes',
      averageFrequency: 'Frecuencia Promedio',
      plusVsLastMonth: '+3% vs mes anterior',
      
      // Admin Actions
      quickActions: 'Acciones Rápidas',
      modalitiesConfig: 'Configurar modalidades',
      preferencesManagement: 'Preferencias y gestión',
      addGraduation: 'Agregar Graduación',
      
      // Error Messages
      cannotLoadPayments: 'No se pudieron cargar los pagos',
      whatsappNotFound: 'Número de WhatsApp de la academia no encontrado',
      cannotOpenWhatsapp: 'No se pudo abrir WhatsApp',
      logoutNotAvailable: 'Función de logout no disponible. Recarga la app.',
      cannotLogout: 'No se pudo cerrar sesión. Intenta nuevamente.',
      cannotLoadClasses: 'No se pudieron cargar las clases',
      cannotUpdateProfile: 'No se pudo actualizar el perfil',
      cannotDeleteClass: 'No se pudo eliminar la clase. Verifica tus permisos.',
      cannotLoadStudents: 'No se pudieron cargar los estudiantes',
      cannotDeleteStudent: 'No se pudo eliminar el estudiante',
      invalidCode: 'Ingresa un código válido',
      cannotProcessCode: 'No se pudo procesar el código',
      invalidQRCode: 'Código QR inválido',
      invalidOrExpiredInvite: 'Invitación inválida o expirada',
      invalidLink: 'Enlace inválido',
      pleaseValidEmail: 'Por favor, ingresa un email válido',
      userDataNotFound: 'Datos de usuario o clase no encontrados',
      cannotCopyLink: 'No se pudo copiar el enlace',
      checkInTimeError: 'Check-in solo se puede hacer 15 minutos antes o después de la hora de clase',
      
      // Success Messages
      classDeletedSuccess: 'Clase eliminada exitosamente',
      studentDeletedSuccess: 'Estudiante eliminado exitosamente',
      
      // Development Messages
      inDevelopment: 'En Desarrollo',
      exportFeatureComingSoon: 'Funcionalidad de exportación se implementará pronto',
      featureComingSoon: 'Funcionalidad se implementará pronto',
      limitedInformation: 'Alguna información puede estar limitada. Intenta nuevamente más tarde.',
      adminOnlyFeature: 'Funcionalidad disponible solo para administradores',
      
      // Alert Titles
      checkIn: 'Check-in',
      warning: 'Advertencia',
      info: 'Info',
      mandatorySelection: 'Selección Obligatoria',
      pleaseSelectUserType: 'Por favor, selecciona el tipo de usuario.',
      cannotSaveUserType: 'No se pudo guardar el tipo de usuario. Intenta nuevamente.',
      
      // Notification Service
      congratsNewGraduation: '¡Felicitaciones! Nueva Graduación',
      newAnnouncement: 'Nuevo Anuncio',
      
      // Logout Confirmation
      confirmExit: 'Confirmar Salida',
      sureToLogout: '¿Estás seguro de que quieres cerrar sesión?',
      exit: 'Salir',
      
      // Payment Status
      paid: 'Pagado',
      pending: 'Pendiente',
      overdue: 'Vencido',
      notInformed: 'No informado',
      pixPayment: 'Pago PIX',
      pixFeatureComingSoon: 'La funcionalidad de pago PIX se implementará pronto',
      
      // Navigation Titles
      newClass: 'Nueva Clase',
      classStudents: 'Estudiantes de la Clase',
      editClass: 'Editar Clase',
      classDetails: 'Detalles de la Clase',
      checkIns: 'Check-ins',
      newStudent: 'Nuevo Estudiante',
      editStudent: 'Editar Estudiante',
      studentDetails: 'Detalles del Estudiante',
      studentPayments: 'Pagos del Estudiante',
      reports: 'Reportes',
      newLesson: 'Nueva Lección',
      myProfile: 'Mi Perfil',
      changePassword: 'Cambiar Contraseña',
      physicalEvaluation: 'Evaluación Física',
      evaluationHistory: 'Historial de Evaluaciones',
      manageInjury: 'Gestionar Lesión',
      myInjuries: 'Mis Lesiones',
      privacyPolicy: 'Política de Privacidad',
      notificationSettings: 'Configuración de Notificaciones',
      privacySettings: 'Configuración de Privacidad',
      
      // Navigation Subtitles
      personalInfoAndSettings: 'Información personal y configuración',
      updateYourPassword: 'Actualiza tu contraseña de acceso',
      recordBodyMeasurements: 'Registra tus medidas corporales',
      trackPhysicalEvolution: 'Sigue tu evolución física',
      recordAndTrackInjuries: 'Registra y sigue las lesiones',
      injuryHistoryAndRecovery: 'Historial de lesiones y recuperación',
      dataProtectionAndLGPD: 'Protección de datos y LGPD',
      manageYourNotifications: 'Gestiona tus notificaciones',
      lgpdAndDataProtection: 'LGPD y protección de datos',
      
      // Tab Navigation
      dashboard: 'Panel',
      payments: 'Pagos',
      evolution: 'Evolución',
      calendar: 'Calendario',
      students: 'Estudiantes',
      classes: 'Clases',
      modalities: 'Modalidades',
      checkIn: 'Check-in',
      instructorReports: 'Reportes',
      lessons: 'Lecciones',
      studentDashboard: 'Panel del Estudiante',
      invites: 'Invitaciones',
      
      // Language Detection
      language: 'es',
    }
  }
};

export { lightTheme, darkTheme };
export default lightTheme;
