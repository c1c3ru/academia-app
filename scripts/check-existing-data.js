// Usar Firebase Web SDK para verificar dados
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA_hzFPt9hUITlMq9BrsJuxAdzycVR3AEI",
  authDomain: "academia-app-5cf79.firebaseapp.com",
  projectId: "academia-app-5cf79",
  storageBucket: "academia-app-5cf79.firebasestorage.app",
  messagingSenderId: "377489252583",
  appId: "1:377489252583:android:87f2c3948511325769c242"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkExistingData() {
  console.log('🔍 Verificando dados existentes no Firestore...\n');

  const collections = ['users', 'students', 'classes', 'instructors', 'payments', 'checkins', 'academias', 'usuarios'];
  
  for (const collectionName of collections) {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, limit(5));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log(`📂 ${collectionName}: Vazia`);
      } else {
        console.log(`📂 ${collectionName}: ${snapshot.size} documentos (mostrando primeiros 5)`);
        
        snapshot.forEach(doc => {
          const data = doc.data();
          console.log(`   📄 ${doc.id}:`, {
            ...Object.keys(data).reduce((acc, key) => {
              // Mostrar apenas campos importantes para análise
              if (['name', 'email', 'tipo', 'userType', 'academiaId', 'title', 'createdAt'].includes(key)) {
                acc[key] = data[key];
              }
              return acc;
            }, {}),
            totalFields: Object.keys(data).length
          });
        });
        console.log('');
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar ${collectionName}:`, error.message);
    }
  }

  // Verificar se há dados que precisam de migração
  console.log('\n📊 ANÁLISE DE MIGRAÇÃO:');
  
  try {
    const usersRef = collection(db, 'users');
    const usuariosRef = collection(db, 'usuarios');
    const academiasRef = collection(db, 'academias');
    
    const usersSnapshot = await getDocs(usersRef);
    const usuariosSnapshot = await getDocs(usuariosRef);
    const academiasSnapshot = await getDocs(academiasRef);
    
    console.log(`👥 Usuários na estrutura legacy (users): ${usersSnapshot.size}`);
    console.log(`👥 Usuários na nova estrutura (usuarios): ${usuariosSnapshot.size}`);
    console.log(`🏢 Academias criadas: ${academiasSnapshot.size}`);
    
    if (usersSnapshot.size > 0 && usuariosSnapshot.size === 0) {
      console.log('\n⚠️  MIGRAÇÃO NECESSÁRIA:');
      console.log('   - Existem usuários na estrutura legacy que precisam ser migrados');
      console.log('   - Será necessário criar script de migração');
    } else if (usersSnapshot.size === 0 && usuariosSnapshot.size === 0) {
      console.log('\n✅ PROJETO NOVO:');
      console.log('   - Não há dados para migrar');
      console.log('   - Sistema multi-tenant pode ser usado diretamente');
    } else {
      console.log('\n🔄 MIGRAÇÃO PARCIAL:');
      console.log('   - Alguns dados já estão na nova estrutura');
      console.log('   - Verificar se migração adicional é necessária');
    }
    
  } catch (error) {
    console.error('❌ Erro na análise:', error.message);
  }
}

checkExistingData()
  .then(() => {
    console.log('\n✅ Análise concluída');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
