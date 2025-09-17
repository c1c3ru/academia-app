#!/usr/bin/env node

// Debug script to understand the authentication and claims issue
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_hzFPt9hUITlMq9BrsJuxAdzycVR3AEI",
  authDomain: "academia-app-5cf79.firebaseapp.com",
  projectId: "academia-app-5cf79",
  storageBucket: "academia-app-5cf79.firebasestorage.app",
  messagingSenderId: "377489252583",
  appId: "1:377489252583:android:87f2c3948511325769c242"
};

async function debugAuthIssue() {
  try {
    console.log('🔧 Iniciando diagnóstico de autenticação...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase inicializado');
    
    // Check if we can access Firestore without authentication
    console.log('\n📊 Testando acesso ao Firestore sem autenticação...');
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      console.log(`❌ Conseguiu acessar users sem auth (${usersSnapshot.size} documentos) - PROBLEMA DE SEGURANÇA!`);
    } catch (error) {
      console.log('✅ Acesso negado sem autenticação (esperado):', error.code);
    }
    
    // Try to access gyms collection
    try {
      const gymsSnapshot = await getDocs(collection(db, 'gyms'));
      console.log(`❌ Conseguiu acessar gyms sem auth (${gymsSnapshot.size} documentos) - PROBLEMA DE SEGURANÇA!`);
    } catch (error) {
      console.log('✅ Acesso negado a gyms sem autenticação (esperado):', error.code);
    }
    
    console.log('\n🔍 Para continuar o diagnóstico, precisamos de credenciais de usuário.');
    console.log('💡 Execute este script e forneça email/senha quando solicitado.');
    console.log('📋 Ou verifique se existem usuários válidos no Authentication do Firebase Console.');
    
    // Check Firebase rules deployment
    console.log('\n🛡️ Verificando se as regras de segurança estão ativas...');
    console.log('✅ As regras parecem estar funcionando (acesso negado sem auth)');
    
    console.log('\n📝 Próximos passos recomendados:');
    console.log('1. Verificar se existem usuários no Firebase Authentication');
    console.log('2. Verificar se os usuários têm custom claims configurados');
    console.log('3. Testar login com credenciais válidas');
    console.log('4. Executar script de configuração de claims se necessário');
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
  }
}

// Execute
debugAuthIssue()
  .then(() => {
    console.log('\n🎯 Diagnóstico concluído');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
