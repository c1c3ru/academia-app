#!/usr/bin/env node

console.log('🔐 Testando autenticação do Firebase...\n');

// Simular ambiente React Native
global.window = {};
global.navigator = {};

const testAuth = async () => {
  try {
    // Testar importações
    console.log('📦 Testando importações...');
    
    const { initializeApp } = require('firebase/app');
    const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
    const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');
    
    console.log('✅ Importações bem-sucedidas');
    
    // Configuração do Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyA_hzFPt9hUITlMq9BrsJuxAdzycVR3AEI",
      authDomain: "academia-app-5cf79.firebaseapp.com",
      projectId: "academia-app-5cf79",
      storageBucket: "academia-app-5cf79.firebasestorage.app",
      messagingSenderId: "377489252583",
      appId: "1:377489252583:android:87f2c3948511325769c242"
    };
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase inicializado');
    
    // Testar credenciais de exemplo
    const testEmail = 'test@example.com';
    const testPassword = 'test123456';
    
    console.log(`\n🧪 Criando usuário de teste: ${testEmail}`);
    
    try {
      // Criar usuário primeiro
      const newUserCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('✅ Usuário criado com sucesso!');
      
      // Criar perfil no Firestore
      await setDoc(doc(db, 'users', newUserCredential.user.uid), {
        name: 'Usuário Teste',
        email: testEmail,
        userType: 'student',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Perfil criado no Firestore');
      
      // Fazer logout para testar o login
      console.log('\n🧪 Testando login...');
      const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('✅ Login bem-sucedido!');
      console.log(`👤 Usuário: ${userCredential.user.email}`);
      
      // Verificar se o usuário existe no Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        console.log('✅ Perfil do usuário encontrado no Firestore');
        console.log('📋 Dados:', userDoc.data());
      } else {
        console.log('⚠️ Perfil do usuário não encontrado no Firestore');
      }
      
    } catch (authError) {
      console.log('❌ Login falhou:', authError.code);
      
      if (authError.code === 'auth/user-not-found') {
        console.log('💡 Usuário não existe. Criando usuário de teste...');
        
        try {
          const newUserCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
          console.log('✅ Usuário criado com sucesso!');
          
          // Criar perfil no Firestore
          await setDoc(doc(db, 'users', newUserCredential.user.uid), {
            name: 'Usuário Teste',
            email: testEmail,
            userType: 'student',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          console.log('✅ Perfil criado no Firestore');
          console.log('🎉 Agora você pode fazer login com:');
          console.log(`   Email: ${testEmail}`);
          console.log(`   Senha: ${testPassword}`);
          
        } catch (createError) {
          console.log('❌ Erro ao criar usuário:', createError.code);
        }
      } else if (authError.code === 'auth/wrong-password') {
        console.log('❌ Senha incorreta');
      } else if (authError.code === 'auth/invalid-email') {
        console.log('❌ Email inválido');
      } else if (authError.code === 'auth/invalid-credential') {
        console.log('❌ Credenciais inválidas');
        console.log('💡 Possíveis causas:');
        console.log('   - Usuário não existe');
        console.log('   - Senha incorreta');
        console.log('   - Problema na configuração do Firebase');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Executar o teste
testAuth(); 