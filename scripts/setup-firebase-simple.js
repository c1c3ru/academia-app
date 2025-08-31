#!/usr/bin/env node

// Script simplificado usando Firebase Web SDK
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Configuração do Firebase (do seu google-services.json)
const firebaseConfig = {
  apiKey: "AIzaSyDqL69c1jBsB7wsuFgOBqJGYQtTATdMirb",
  authDomain: "academia-app-5cf79.firebaseapp.com",
  projectId: "academia-app-5cf79",
  storageBucket: "academia-app-5cf79.firebasestorage.app",
  messagingSenderId: "377489252583",
  appId: "1:377489252583:android:87f2c3948511325769c242"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dados iniciais
const initialData = {
  modalities: [
    {
      name: 'Judô',
      description: 'Arte marcial japonesa focada em técnicas de projeção e imobilização',
      graduationLevels: ['Branca', 'Amarela', 'Laranja', 'Verde', 'Roxa', 'Marrom', 'Preta'],
      monthlyPrice: 150.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Karatê',
      description: 'Arte marcial japonesa focada em golpes de punho e chutes',
      graduationLevels: ['Branca', 'Amarela', 'Vermelha', 'Laranja', 'Verde', 'Roxa', 'Marrom', 'Preta'],
      monthlyPrice: 140.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Jiu-Jitsu',
      description: 'Arte marcial brasileira focada em luta no solo e submissões',
      graduationLevels: ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'],
      monthlyPrice: 160.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Taekwondo',
      description: 'Arte marcial coreana focada em chutes altos e técnicas de pernas',
      graduationLevels: ['Branca', 'Amarela', 'Laranja', 'Verde', 'Azul', 'Vermelha', 'Preta 1º Dan', 'Preta 2º Dan', 'Preta 3º Dan'],
      monthlyPrice: 145.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Muay Thai',
      description: 'Arte marcial tailandesa conhecida como "A Arte das Oito Armas"',
      graduationLevels: ['Branca', 'Amarela', 'Verde', 'Azul', 'Vermelha', 'Preta'],
      monthlyPrice: 155.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Boxe',
      description: 'Arte marcial ocidental focada em técnicas de punho',
      graduationLevels: ['Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Competidor'],
      monthlyPrice: 130.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Kickboxing',
      description: 'Combinação de técnicas de boxe e chutes',
      graduationLevels: ['Branca', 'Amarela', 'Verde', 'Azul', 'Vermelha', 'Preta'],
      monthlyPrice: 135.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Aikido',
      description: 'Arte marcial japonesa focada em técnicas de defesa e harmonia',
      graduationLevels: ['6º Kyu', '5º Kyu', '4º Kyu', '3º Kyu', '2º Kyu', '1º Kyu', '1º Dan', '2º Dan', '3º Dan'],
      monthlyPrice: 165.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Kung Fu',
      description: 'Arte marcial chinesa tradicional com diversos estilos',
      graduationLevels: ['Branca', 'Amarela', 'Laranja', 'Verde', 'Azul', 'Roxa', 'Marrom', 'Preta'],
      monthlyPrice: 170.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Capoeira',
      description: 'Arte marcial brasileira que combina luta, dança e música',
      graduationLevels: ['Crua', 'Amarela', 'Laranja', 'Verde', 'Azul', 'Roxa', 'Marrom', 'Cordão'],
      monthlyPrice: 120.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Krav Maga',
      description: 'Sistema de combate israelense focado em defesa pessoal',
      graduationLevels: ['P1', 'P2', 'P3', 'P4', 'P5', 'G1', 'G2', 'G3', 'G4', 'G5'],
      monthlyPrice: 180.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'MMA',
      description: 'Artes Marciais Mistas - combinação de diversas modalidades',
      graduationLevels: ['Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Profissional'],
      monthlyPrice: 200.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Jeet Kune Do',
      description: 'Filosofia de combate criada por Bruce Lee',
      graduationLevels: ['Aprendiz', 'Praticante', 'Instrutor Assistente', 'Instrutor', 'Instrutor Sênior'],
      monthlyPrice: 190.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Hapkido',
      description: 'Arte marcial coreana que combina técnicas de defesa e ataque',
      graduationLevels: ['10º Gup', '9º Gup', '8º Gup', '7º Gup', '6º Gup', '5º Gup', '4º Gup', '3º Gup', '2º Gup', '1º Gup', '1º Dan'],
      monthlyPrice: 175.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Ninjutsu',
      description: 'Arte marcial japonesa tradicional dos ninjas',
      graduationLevels: ['9º Kyu', '8º Kyu', '7º Kyu', '6º Kyu', '5º Kyu', '4º Kyu', '3º Kyu', '2º Kyu', '1º Kyu', '1º Dan'],
      monthlyPrice: 185.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Esgrima',
      description: 'Arte marcial europeia com uso de espadas',
      graduationLevels: ['E', 'D', 'C', 'B', 'A'],
      monthlyPrice: 220.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Savate',
      description: 'Arte marcial francesa que combina chutes e socos',
      graduationLevels: ['Azul', 'Verde', 'Vermelha', 'Branca', 'Amarela', 'Prata'],
      monthlyPrice: 165.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Sambo',
      description: 'Arte marcial russa focada em técnicas de luta e submissão',
      graduationLevels: ['Branca', 'Amarela', 'Laranja', 'Verde', 'Azul', 'Roxa', 'Marrom', 'Preta'],
      monthlyPrice: 170.00,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ],
  
  announcements: [
    {
      title: 'Bem-vindos à Academia!',
      content: 'Estamos felizes em tê-los conosco. Vamos treinar juntos e evoluir nas artes marciais!',
      authorId: 'system',
      targetAudience: 'all',
      isActive: true,
      priority: 'medium',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      title: 'Novo Sistema de Check-in',
      content: 'Agora você pode fazer check-in nas aulas usando geolocalização. Certifique-se de estar na academia!',
      authorId: 'system',
      targetAudience: 'students',
      isActive: true,
      priority: 'high',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      title: 'Pagamentos Online Disponíveis',
      content: 'Agora você pode pagar suas mensalidades via PIX ou cartão diretamente pelo app!',
      authorId: 'system',
      targetAudience: 'all',
      isActive: true,
      priority: 'high',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ],

  // Dados de exemplo para outras coleções
  sampleUsers: [
    {
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-1234',
      userType: 'student',
      isActive: true,
      currentGraduation: 'Amarela',
      graduations: [
        {
          modalityId: 'judo',
          level: 'Branca',
          date: new Date('2024-01-15'),
          instructorId: 'instructor1'
        },
        {
          modalityId: 'judo',
          level: 'Amarela',
          date: new Date('2024-06-15'),
          instructorId: 'instructor1'
        }
      ],
      classIds: ['class1', 'class2'],
      profileImage: null,
      bio: 'Praticante de judô há 2 anos, sempre buscando evolução.',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '(11) 99999-5678',
      userType: 'instructor',
      isActive: true,
      currentGraduation: 'Preta 3º Dan',
      graduations: [],
      classIds: ['class1', 'class3'],
      profileImage: null,
      bio: 'Sensei de Judô com 15 anos de experiência. Especialista em técnicas de projeção.',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Carlos Admin',
      email: 'admin@academia.com',
      phone: '(11) 99999-0000',
      userType: 'admin',
      isActive: true,
      currentGraduation: null,
      graduations: [],
      classIds: [],
      profileImage: null,
      bio: 'Administrador do sistema da academia.',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ],

  sampleClasses: [
    {
      name: 'Judô Iniciante',
      description: 'Turma para iniciantes no judô, focada em fundamentos básicos',
      modalityId: 'judo-id',
      instructorId: 'instructor1',
      schedule: {
        dayOfWeek: 1, // Segunda-feira
        startTime: '19:00',
        endTime: '20:30'
      },
      maxStudents: 20,
      currentStudents: 8,
      studentIds: ['student1', 'student2'],
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: 'Karatê Avançado',
      description: 'Turma avançada de karatê com foco em kumite',
      modalityId: 'karate-id',
      instructorId: 'instructor2',
      schedule: {
        dayOfWeek: 3, // Quarta-feira
        startTime: '20:00',
        endTime: '21:30'
      },
      maxStudents: 15,
      currentStudents: 12,
      studentIds: ['student3', 'student4'],
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ],

  samplePayments: [
    {
      studentId: 'student1',
      amount: 150.00,
      dueDate: new Date('2024-12-05'),
      paidDate: null,
      status: 'pending',
      method: null,
      description: 'Mensalidade Dezembro 2024 - Judô',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      studentId: 'student1',
      amount: 150.00,
      dueDate: new Date('2024-11-05'),
      paidDate: new Date('2024-11-03'),
      status: 'paid',
      method: 'pix',
      description: 'Mensalidade Novembro 2024 - Judô',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ]
};

// Função para criar dados
async function createInitialData() {
  try {
    console.log('🔥 Criando dados iniciais no Firestore...\n');

    // Criar modalidades
    console.log('📚 Criando modalidades...');
    const modalityIds = {};
    for (const modality of initialData.modalities) {
      const docRef = await addDoc(collection(db, 'modalities'), modality);
      modalityIds[modality.name.toLowerCase().replace(/[^a-z0-9]/g, '')] = docRef.id;
      console.log(`✅ Modalidade "${modality.name}" criada com ID: ${docRef.id}`);
    }

    // Criar anúncios
    console.log('\n📢 Criando anúncios...');
    for (const announcement of initialData.announcements) {
      const docRef = await addDoc(collection(db, 'announcements'), announcement);
      console.log(`✅ Anúncio "${announcement.title}" criado com ID: ${docRef.id}`);
    }

    // Criar usuários de exemplo
    console.log('\n👥 Criando usuários de exemplo...');
    const userIds = {};
    for (const user of initialData.sampleUsers) {
      const docRef = await addDoc(collection(db, 'users'), user);
      userIds[user.userType] = docRef.id;
      console.log(`✅ Usuário "${user.name}" (${user.userType}) criado com ID: ${docRef.id}`);
    }

    // Criar turmas de exemplo
    console.log('\n🏫 Criando turmas de exemplo...');
    for (const classData of initialData.sampleClasses) {
      // Atualizar com IDs reais das modalidades
      const updatedClass = {
        ...classData,
        modalityId: modalityIds['judo'] || 'judo-placeholder',
        instructorId: userIds['instructor'] || 'instructor-placeholder'
      };
      const docRef = await addDoc(collection(db, 'classes'), updatedClass);
      console.log(`✅ Turma "${classData.name}" criada com ID: ${docRef.id}`);
    }

    // Criar pagamentos de exemplo
    console.log('\n💰 Criando pagamentos de exemplo...');
    for (const payment of initialData.samplePayments) {
      const updatedPayment = {
        ...payment,
        studentId: userIds['student'] || 'student-placeholder'
      };
      const docRef = await addDoc(collection(db, 'payments'), updatedPayment);
      console.log(`✅ Pagamento criado com ID: ${docRef.id}`);
    }

    console.log('\n🎉 Estrutura completa criada com sucesso!');
    console.log('\n📊 Coleções criadas:');
    console.log('- modalities: 18 modalidades');
    console.log('- announcements: 3 anúncios');
    console.log('- users: 3 usuários (student, instructor, admin)');
    console.log('- classes: 2 turmas de exemplo');
    console.log('- payments: 2 pagamentos de exemplo');
    
    console.log('\n📋 Próximos passos:');
    console.log('1. Aplicar regras de segurança: firebase deploy --only firestore:rules');
    console.log('2. Criar índices: firebase deploy --only firestore:indexes');
    console.log('3. Testar o app com os dados criados');

  } catch (error) {
    console.error('❌ Erro ao criar dados:', error);
    process.exit(1);
  }
}

// Executar
createInitialData().then(() => {
  console.log('\n✅ Script concluído!');
  process.exit(0);
}).catch(console.error);
