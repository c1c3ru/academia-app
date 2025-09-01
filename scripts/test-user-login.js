#!/usr/bin/env node

console.log('🔐 Testando login com credenciais do usuário...\n');

// Simular ambiente React Native
global.window = {};
global.navigator = {};

const testUserLogin = async () => {
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
    
    // Credenciais do usuário
    const userEmail = 'cicero.silva@ifce.edu.br';
    const userPassword = '123456';
    
    console.log(`\n🧪 Testando login com: ${userEmail}`);
    console.log(`📧 Email válido: ${userEmail && userEmail.includes('@')}`);
    console.log(`🔑 Senha: ${userPassword ? '***' : 'undefined'}`);
    
    try {
      // Tentar fazer login
      const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
      console.log('✅ Login bem-sucedido!');
      console.log(`👤 Usuário: ${userCredential.user.email}`);
      console.log(`🆔 UID: ${userCredential.user.uid}`);
      
      // Verificar se o usuário existe no Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        console.log('✅ Perfil do usuário encontrado no Firestore');
        console.log('📋 Dados:', userDoc.data());
      } else {
        console.log('⚠️ Perfil do usuário não encontrado no Firestore');
        console.log('💡 Criando perfil...');
        
        // Criar perfil no Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: 'Cícero Silva',
          email: userEmail,
          userType: 'student',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log('✅ Perfil criado no Firestore');
      }
      
    } catch (authError) {
      console.log('❌ Login falhou:', authError.code);
      console.log('📝 Mensagem:', authError.message);
      
      if (authError.code === 'auth/user-not-found') {
        console.log('💡 Usuário não existe. Criando usuário...');
        
        try {
          const newUserCredential = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
          console.log('✅ Usuário criado com sucesso!');
          
          // Criar perfil no Firestore
          await setDoc(doc(db, 'users', newUserCredential.user.uid), {
            name: 'Cícero Silva',
            email: userEmail,
            userType: 'student',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          console.log('✅ Perfil criado no Firestore');
          console.log('🎉 Agora você pode fazer login com:');
          console.log(`   Email: ${userEmail}`);
          console.log(`   Senha: ${userPassword}`);
          
        } catch (createError) {
          console.log('❌ Erro ao criar usuário:', createError.code);
          console.log('📝 Mensagem:', createError.message);
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
        console.log('   - Email mal formatado');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Executar o teste
testUserLogin(); 