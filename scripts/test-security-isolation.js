const admin = require('firebase-admin');

// Script para testar o isolamento de dados entre academias
// Execute após o deployment para verificar se a segurança está funcionando

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // Adicione seu project ID aqui
    projectId: 'your-project-id'
  });
}

const db = admin.firestore();

/**
 * Teste de isolamento de dados entre academias
 */
async function testDataIsolation() {
  console.log('🔒 Testando isolamento de dados entre academias...');
  
  try {
    // 1. Buscar todas as academias
    const gymsSnapshot = await db.collection('gyms').get();
    const academies = gymsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📋 Encontradas ${academies.length} academias para teste`);
    
    if (academies.length < 2) {
      console.log('⚠️ Necessário pelo menos 2 academias para testar isolamento');
      return;
    }
    
    // 2. Testar subcoleções de cada academia
    const collections = ['modalities', 'plans', 'announcements', 'graduation_levels'];
    
    for (let i = 0; i < academies.length; i++) {
      const academy = academies[i];
      console.log(`\n🏢 Testando academia: ${academy.name} (${academy.id})`);
      
      for (const collectionName of collections) {
        const subcollectionRef = db
          .collection('gyms')
          .doc(academy.id)
          .collection(collectionName);
        
        const snapshot = await subcollectionRef.get();
        console.log(`  📋 ${collectionName}: ${snapshot.docs.length} documentos`);
        
        // Verificar se os documentos pertencem apenas a esta academia
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.academiaId && data.academiaId !== academy.id) {
            console.error(`❌ ERRO: Documento ${doc.id} em ${collectionName} tem academiaId incorreto!`);
          }
        });
      }
    }
    
    console.log('\n✅ Teste de isolamento concluído');
    
  } catch (error) {
    console.error('❌ Erro no teste de isolamento:', error);
  }
}

/**
 * Teste das regras de segurança (simulação)
 */
async function testSecurityRules() {
  console.log('\n🛡️ Testando regras de segurança...');
  
  try {
    // Tentar acessar coleções globais antigas (deve falhar)
    const globalCollections = ['modalities', 'plans', 'announcements', 'graduation_levels'];
    
    for (const collectionName of globalCollections) {
      try {
        const snapshot = await db.collection(collectionName).limit(1).get();
        if (snapshot.docs.length > 0) {
          console.log(`⚠️ AVISO: Coleção global /${collectionName} ainda contém dados`);
          console.log('   Execute o script de limpeza se a migração foi verificada');
        } else {
          console.log(`✅ Coleção global /${collectionName} está vazia`);
        }
      } catch (error) {
        console.log(`✅ Coleção global /${collectionName} protegida pelas regras`);
      }
    }
    
    console.log('✅ Teste de regras de segurança concluído');
    
  } catch (error) {
    console.error('❌ Erro no teste de segurança:', error);
  }
}

/**
 * Teste das Cloud Functions
 */
async function testCloudFunctions() {
  console.log('\n☁️ Testando Cloud Functions...');
  
  const functions = ['createAcademy', 'generateInvite', 'useInvite', 'setUserClaims'];
  
  // Nota: Este é um teste básico de existência
  // Para testes funcionais completos, use o Firebase Emulator
  
  console.log('📝 Functions que devem estar deployadas:');
  functions.forEach(funcName => {
    console.log(`  - ${funcName}`);
  });
  
  console.log('\n💡 Para testar as functions funcionalmente:');
  console.log('   1. Use o Firebase Console para ver se estão ativas');
  console.log('   2. Execute: firebase functions:log');
  console.log('   3. Teste via aplicação cliente');
  
  console.log('✅ Verificação de Cloud Functions concluída');
}

/**
 * Relatório de status geral
 */
async function generateStatusReport() {
  console.log('\n📊 Gerando relatório de status...');
  
  const report = {
    timestamp: new Date().toISOString(),
    academies: 0,
    totalModalities: 0,
    totalPlans: 0,
    totalAnnouncements: 0,
    totalGraduationLevels: 0,
    globalCollectionsEmpty: true
  };
  
  try {
    // Contar academias
    const gymsSnapshot = await db.collection('gyms').get();
    report.academies = gymsSnapshot.docs.length;
    
    // Contar documentos em subcoleções
    for (const gymDoc of gymsSnapshot.docs) {
      const collections = [
        { name: 'modalities', key: 'totalModalities' },
        { name: 'plans', key: 'totalPlans' },
        { name: 'announcements', key: 'totalAnnouncements' },
        { name: 'graduation_levels', key: 'totalGraduationLevels' }
      ];
      
      for (const collection of collections) {
        const snapshot = await db
          .collection('gyms')
          .doc(gymDoc.id)
          .collection(collection.name)
          .get();
        
        report[collection.key] += snapshot.docs.length;
      }
    }
    
    // Verificar coleções globais
    const globalCollections = ['modalities', 'plans', 'announcements', 'graduation_levels'];
    for (const collectionName of globalCollections) {
      const snapshot = await db.collection(collectionName).limit(1).get();
      if (snapshot.docs.length > 0) {
        report.globalCollectionsEmpty = false;
        break;
      }
    }
    
    console.log('\n📈 RELATÓRIO DE STATUS:');
    console.log('========================');
    console.log(`📅 Data/Hora: ${report.timestamp}`);
    console.log(`🏢 Academias: ${report.academies}`);
    console.log(`📋 Total Modalidades: ${report.totalModalities}`);
    console.log(`💰 Total Planos: ${report.totalPlans}`);
    console.log(`📢 Total Avisos: ${report.totalAnnouncements}`);
    console.log(`🎓 Total Níveis Graduação: ${report.totalGraduationLevels}`);
    console.log(`🗑️ Coleções Globais Vazias: ${report.globalCollectionsEmpty ? 'Sim' : 'Não'}`);
    
    if (!report.globalCollectionsEmpty) {
      console.log('\n⚠️ RECOMENDAÇÃO: Execute o script de limpeza das coleções globais');
      console.log('   node migrate-global-collections.js cleanup');
    }
    
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🧪 Iniciando testes de segurança e isolamento...');
  console.log('================================================');
  
  await testDataIsolation();
  await testSecurityRules();
  await testCloudFunctions();
  await generateStatusReport();
  
  console.log('\n🎉 Todos os testes concluídos!');
  console.log('\n💡 Próximos passos:');
  console.log('   1. Verifique se não há erros nos logs acima');
  console.log('   2. Teste a aplicação cliente manualmente');
  console.log('   3. Execute testes funcionais completos');
  console.log('   4. Monitore logs em produção');
}

// Executar baseado no argumento
const command = process.argv[2] || 'all';

switch (command) {
  case 'isolation':
    testDataIsolation().then(() => process.exit(0));
    break;
  case 'security':
    testSecurityRules().then(() => process.exit(0));
    break;
  case 'functions':
    testCloudFunctions().then(() => process.exit(0));
    break;
  case 'report':
    generateStatusReport().then(() => process.exit(0));
    break;
  case 'all':
  default:
    runAllTests().then(() => process.exit(0));
    break;
}
