#!/usr/bin/env node

// Client-side authentication fix script
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc, collection, getDocs, updateDoc } = require('firebase/firestore');
const readline = require('readline');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_hzFPt9hUITlMq9BrsJuxAdzycVR3AEI",
  authDomain: "academia-app-5cf79.firebaseapp.com",
  projectId: "academia-app-5cf79",
  storageBucket: "academia-app-5cf79.firebasestorage.app",
  messagingSenderId: "377489252583",
  appId: "1:377489252583:android:87f2c3948511325769c242"
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function fixAuthenticationIssue() {
  try {
    console.log('🔧 Iniciando correção de autenticação...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase inicializado');
    
    // Get user credentials
    console.log('\n🔐 Para diagnosticar e corrigir o problema, precisamos fazer login com um usuário admin.');
    const email = await question('📧 Digite o email do usuário admin: ');
    const password = await question('🔑 Digite a senha: ');
    
    try {
      // Sign in
      console.log('\n🔐 Fazendo login...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Login realizado com sucesso!');
      console.log(`👤 Usuário: ${user.email} (${user.uid})`);
      
      // Check current claims
      console.log('\n📋 Verificando custom claims atuais...');
      const idTokenResult = await user.getIdTokenResult(true);
      console.log('Claims atuais:', JSON.stringify(idTokenResult.claims, null, 2));
      
      const hasValidClaims = !!(idTokenResult.claims.role && idTokenResult.claims.academiaId);
      
      if (hasValidClaims) {
        console.log('✅ Usuário já tem claims válidos!');
        
        // Test Firestore access
        console.log('\n🧪 Testando acesso ao Firestore...');
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            console.log('✅ Acesso ao documento do usuário: OK');
            console.log('Dados do usuário:', userDoc.data());
          }
          
          const academiaId = idTokenResult.claims.academiaId;
          const academiaDoc = await getDoc(doc(db, 'gyms', academiaId));
          if (academiaDoc.exists()) {
            console.log('✅ Acesso à academia: OK');
            console.log('Nome da academia:', academiaDoc.data().name);
          }
          
          console.log('\n🎉 Autenticação e permissões estão funcionando corretamente!');
          console.log('💡 O problema pode estar na aplicação principal. Verifique:');
          console.log('   1. Se o usuário está fazendo login corretamente');
          console.log('   2. Se os custom claims estão sendo carregados na app');
          console.log('   3. Se há erros de rede ou configuração');
          
        } catch (firestoreError) {
          console.error('❌ Erro ao acessar Firestore:', firestoreError.code, firestoreError.message);
          console.log('🔍 Isso indica um problema com as regras de segurança ou claims');
        }
        
      } else {
        console.log('❌ Usuário NÃO tem claims válidos');
        console.log('🔧 Este usuário precisa de custom claims configurados via Firebase Admin SDK');
        console.log('💡 Opções para corrigir:');
        console.log('   1. Usar Firebase Console para definir custom claims');
        console.log('   2. Usar Cloud Functions para definir claims');
        console.log('   3. Usar Firebase Admin SDK com service account');
        
        // Try to get user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('\n📊 Dados do usuário no Firestore:');
            console.log(`   Email: ${userData.email}`);
            console.log(`   Tipo: ${userData.tipo || userData.userType || 'não definido'}`);
            console.log(`   Academia ID: ${userData.academiaId || 'não definido'}`);
            
            console.log('\n💡 Claims recomendados baseados nos dados:');
            const recommendedRole = userData.tipo === 'admin' || userData.userType === 'admin' ? 'admin' : 
                                  userData.tipo === 'instructor' || userData.userType === 'instructor' ? 'instructor' : 'student';
            console.log(`   role: "${recommendedRole}"`);
            console.log(`   academiaId: "${userData.academiaId || 'NECESSÁRIO_DEFINIR'}"`);
          }
        } catch (error) {
          console.error('❌ Erro ao buscar dados do usuário:', error.message);
        }
      }
      
    } catch (authError) {
      console.error('❌ Erro no login:', authError.code, authError.message);
      console.log('💡 Verifique se o email e senha estão corretos');
      console.log('💡 Verifique se o usuário existe no Firebase Authentication');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    rl.close();
  }
}

// Execute
fixAuthenticationIssue()
  .then(() => {
    console.log('\n🎯 Diagnóstico de autenticação concluído');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
