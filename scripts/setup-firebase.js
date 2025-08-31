#!/usr/bin/env node

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Configuração do Firebase Admin
const serviceAccount = require('../google-services.json');

// Extrair project_id do google-services.json
const projectId = serviceAccount.project_info.project_id;

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: projectId,
    private_key_id: "dummy_key_id",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\nxIuOAiOfHkMkfn2cpgfoFsO0fYH5FkJvNdFxQzfzdsKyhXjrd/uHswx5ofhsFez6\nkcj+rify/v7+mwdxjFteTdnSuVoYjey2coxHHE/nrboHxI1wIR4QTRTRHrEQDQVT\n9xtaqoz6QAjOBqJGYQtTATdMirbXvFD8AyFpHV+InfVg5SfuiNG2cxvwWQ8lBMdp\nEu4=\n-----END PRIVATE KEY-----\n",
    client_email: `firebase-adminsdk@${projectId}.iam.gserviceaccount.com`,
    client_id: "dummy_client_id",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token"
  }),
  databaseURL: `https://${projectId}-default-rtdb.firebaseio.com/`
});

const db = admin.firestore();

// Dados iniciais para as coleções
const initialData = {
  modalities: [
    {
      name: 'Judô',
      description: 'Arte marcial japonesa focada em técnicas de projeção e imobilização',
      graduationLevels: ['Branca', 'Amarela', 'Laranja', 'Verde', 'Roxa', 'Marrom', 'Preta'],
      monthlyPrice: 150.00,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      name: 'Karatê',
      description: 'Arte marcial japonesa focada em golpes de punho e chutes',
      graduationLevels: ['Branca', 'Amarela', 'Vermelha', 'Laranja', 'Verde', 'Roxa', 'Marrom', 'Preta'],
      monthlyPrice: 140.00,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      name: 'Jiu-Jitsu',
      description: 'Arte marcial brasileira focada em luta no solo e submissões',
      graduationLevels: ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'],
      monthlyPrice: 160.00,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      title: 'Novo Sistema de Check-in',
      content: 'Agora você pode fazer check-in nas aulas usando geolocalização. Certifique-se de estar na academia!',
      authorId: 'system',
      targetAudience: 'students',
      isActive: true,
      priority: 'high',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      title: 'Pagamentos Online Disponíveis',
      content: 'Agora você pode pagar suas mensalidades via PIX ou cartão diretamente pelo app!',
      authorId: 'system',
      targetAudience: 'all',
      isActive: true,
      priority: 'high',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ]
};

// Função para criar coleções e documentos
async function setupFirebaseCollections() {
  try {
    console.log('🔥 Iniciando configuração do Firebase Firestore...\n');

    // Criar modalidades
    console.log('📚 Criando modalidades...');
    for (const modality of initialData.modalities) {
      const docRef = await db.collection('modalities').add(modality);
      console.log(`✅ Modalidade "${modality.name}" criada com ID: ${docRef.id}`);
    }

    // Criar anúncios
    console.log('\n📢 Criando anúncios...');
    for (const announcement of initialData.announcements) {
      const docRef = await db.collection('announcements').add(announcement);
      console.log(`✅ Anúncio "${announcement.title}" criado com ID: ${docRef.id}`);
    }

    // Criar índices (apenas log - índices devem ser criados no console)
    console.log('\n📊 Índices recomendados para criar no Firebase Console:');
    console.log('- users: userType (ASC), isActive (ASC)');
    console.log('- classes: instructorId (ASC), isActive (ASC)');
    console.log('- payments: studentId (ASC), status (ASC), dueDate (ASC)');
    console.log('- checkins: classId (ASC), date (DESC)');
    console.log('- notifications: userId (ASC), isRead (ASC), createdAt (DESC)');

    console.log('\n🎉 Configuração do Firebase concluída com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Aplicar regras de segurança no Firebase Console');
    console.log('2. Criar índices recomendados');
    console.log('3. Testar o app');

  } catch (error) {
    console.error('❌ Erro na configuração:', error);
    process.exit(1);
  }
}

// Função para verificar coleções existentes
async function checkExistingCollections() {
  try {
    console.log('🔍 Verificando coleções existentes...\n');

    const collections = ['users', 'classes', 'modalities', 'payments', 'checkins', 'graduations', 'announcements', 'notifications'];
    
    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).limit(1).get();
        const count = snapshot.size;
        console.log(`📁 ${collectionName}: ${count > 0 ? `${count}+ documentos` : 'Vazia'}`);
      } catch (error) {
        console.log(`📁 ${collectionName}: Não existe`);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao verificar coleções:', error);
  }
}

// Função para criar usuário admin de exemplo
async function createAdminUser() {
  try {
    console.log('\n👤 Criando usuário administrador de exemplo...');
    
    const adminData = {
      name: 'Administrador Sistema',
      email: 'admin@academia.com',
      phone: '(11) 99999-9999',
      userType: 'admin',
      isActive: true,
      currentGraduation: null,
      graduations: [],
      classIds: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Criar usuário no Authentication
    const userRecord = await admin.auth().createUser({
      email: adminData.email,
      password: 'admin123456',
      displayName: adminData.name,
      emailVerified: true
    });

    // Criar documento no Firestore
    await db.collection('users').doc(userRecord.uid).set(adminData);
    
    console.log(`✅ Usuário admin criado:`);
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Senha: admin123456`);
    console.log(`   UID: ${userRecord.uid}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'setup':
      await setupFirebaseCollections();
      break;
    
    case 'check':
      await checkExistingCollections();
      break;
    
    case 'admin':
      await createAdminUser();
      break;
    
    case 'all':
      await checkExistingCollections();
      await setupFirebaseCollections();
      await createAdminUser();
      break;
    
    default:
      console.log('🔥 Firebase Setup CLI\n');
      console.log('Comandos disponíveis:');
      console.log('  setup  - Criar coleções e dados iniciais');
      console.log('  check  - Verificar coleções existentes');
      console.log('  admin  - Criar usuário administrador');
      console.log('  all    - Executar todos os comandos');
      console.log('\nExemplo: node scripts/setup-firebase.js setup');
      break;
  }

  process.exit(0);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  setupFirebaseCollections,
  checkExistingCollections,
  createAdminUser
};
