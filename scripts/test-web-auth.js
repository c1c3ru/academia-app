#!/usr/bin/env node

console.log('🌐 Testando autenticação no ambiente web...\n');

// Simular ambiente web
global.window = {
  location: { href: 'http://localhost:3000' },
  navigator: { userAgent: 'Mozilla/5.0' }
};
global.navigator = global.window.navigator;
global.document = {
  createElement: () => ({}),
  getElementsByTagName: () => []
};

const testWebAuth = async () => {
  try {
    // Testar importações
    console.log('📦 Testando importações...');
    
    const { initializeApp } = require('firebase/app');
    const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
    const { getFirestore, doc, getDoc } = require('firebase/firestore');
    
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
    console.log('🌐 Auth domain:', firebaseConfig.authDomain);
    console.log('🔑 API Key:', firebaseConfig.apiKey ? 'Presente' : 'Ausente');
    
    // Credenciais do usuário
    const userEmail = 'cicero.silva@ifce.edu.br';
    const userPassword = '123456';
    
    console.log(`\n🧪 Testando login web com: ${userEmail}`);
    
    // Simular dados como no React Native
    const cleanEmail = userEmail.trim().toLowerCase();
    const cleanPassword = userPassword.trim();
    
    console.log('🧹 Dados processados:', {
      email: cleanEmail,
      password: cleanPassword ? '***' : 'undefined',
      emailType: typeof cleanEmail,
      passwordType: typeof cleanPassword
    });
    
    try {
      // Tentar fazer login
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      console.log('✅ Login web bem-sucedido!');
      console.log(`👤 Usuário: ${userCredential.user.email}`);
      console.log(`🆔 UID: ${userCredential.user.uid}`);
      
      // Verificar se o usuário existe no Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        console.log('✅ Perfil do usuário encontrado no Firestore');
        console.log('📋 Dados:', userDoc.data());
      } else {
        console.log('⚠️ Perfil do usuário não encontrado no Firestore');
      }
      
    } catch (authError) {
      console.log('❌ Login web falhou:', authError.code);
      console.log('📝 Mensagem:', authError.message);
      console.log('🔍 Stack:', authError.stack);
      
      if (authError.code === 'auth/invalid-credential') {
        console.log('💡 Análise do erro auth/invalid-credential:');
        console.log('   - Verificar se o email está correto');
        console.log('   - Verificar se a senha está correta');
        console.log('   - Verificar se há espaços extras');
        console.log('   - Verificar se o Firebase está configurado corretamente');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste web:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Executar o teste
testWebAuth(); 