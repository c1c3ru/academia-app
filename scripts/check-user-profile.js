const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, query, where, getDocs } = require('firebase/firestore');

// Configuração do Firebase (usando as mesmas configurações do app)
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
const db = getFirestore(app);

async function checkUserProfile(email) {
  console.log(`🔍 Verificando perfil do usuário: ${email}`);
  
  try {
    // 1. Buscar por UID (se o email for o UID)
    console.log('\n1. Buscando por UID direto...');
    let userDoc = await getDoc(doc(db, 'users', email));
    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log('✅ Encontrado em users (por UID):', {
        email: data.email,
        academiaId: data.academiaId,
        tipo: data.tipo,
        userType: data.userType,
        nome: data.nome
      });
      return data;
    }
    
    // 2. Buscar por email
    console.log('\n2. Buscando por email...');
    
    // Buscar em users
    const usersQuery = query(collection(db, 'users'), where('email', '==', email));
    const usersSnapshot = await getDocs(usersQuery);
    
    if (!usersSnapshot.empty) {
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log('✅ Encontrado em users (por email):', {
          id: doc.id,
          email: data.email,
          academiaId: data.academiaId,
          tipo: data.tipo,
          userType: data.userType,
          nome: data.nome
        });
      });
      return usersSnapshot.docs[0].data();
    }
    
    console.log('❌ Usuário não encontrado em nenhuma coleção');
    return null;
    
  } catch (error) {
    console.error('❌ Erro ao verificar perfil:', error.message);
    return null;
  }
}

// Verificar o usuário específico
checkUserProfile('cicerosilva@ifce.edu.br')
  .then(userData => {
    if (userData) {
      console.log('\n📊 DIAGNÓSTICO:');
      if (!userData.academiaId) {
        console.log('🔴 PROBLEMA: usuário não tem academiaId definido');
        console.log('💡 SOLUÇÃO: usuário precisa se associar à academia novamente');
      } else {
        console.log('✅ Usuário tem academiaId:', userData.academiaId);
        console.log('💡 Possível problema: dados da academia não carregaram ou foram corrompidos');
      }
    }
  })
  .catch(console.error);
