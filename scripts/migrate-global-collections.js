const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // Add your project ID here
    projectId: 'your-project-id'
  });
}

const db = admin.firestore();

/**
 * Script para migrar coleções globais para subcoleções específicas de cada academia
 * 
 * Este script migra:
 * - /modalities -> /gyms/{academiaId}/modalities
 * - /plans -> /gyms/{academiaId}/plans  
 * - /announcements -> /gyms/{academiaId}/announcements
 * - /graduation_levels -> /gyms/{academiaId}/graduation_levels
 */

async function migrateGlobalCollections() {
  console.log('🔄 Iniciando migração de coleções globais...');
  
  try {
    // 1. Buscar todas as academias
    const gymsSnapshot = await db.collection('gyms').get();
    const academies = gymsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📋 Encontradas ${academies.length} academias`);
    
    if (academies.length === 0) {
      console.log('❌ Nenhuma academia encontrada. Criando academia de exemplo...');
      
      // Criar uma academia de exemplo se não houver nenhuma
      const exampleAcademyRef = db.collection('gyms').doc();
      await exampleAcademyRef.set({
        name: 'Academia Exemplo',
        description: 'Academia criada durante migração',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      academies.push({
        id: exampleAcademyRef.id,
        name: 'Academia Exemplo'
      });
      
      console.log(`✅ Academia de exemplo criada: ${exampleAcademyRef.id}`);
    }
    
    // 2. Migrar cada coleção global
    const collections = ['modalities', 'plans', 'announcements', 'graduation_levels'];
    
    for (const collectionName of collections) {
      console.log(`\n🔄 Migrando coleção: ${collectionName}`);
      
      // Buscar todos os documentos da coleção global
      const globalSnapshot = await db.collection(collectionName).get();
      const documents = globalSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`📄 Encontrados ${documents.length} documentos em /${collectionName}`);
      
      if (documents.length === 0) {
        console.log(`⚠️ Nenhum documento encontrado em /${collectionName}, pulando...`);
        continue;
      }
      
      // Para cada academia, copiar os documentos
      for (const academy of academies) {
        console.log(`📋 Copiando ${documents.length} documentos de ${collectionName} para academia ${academy.name} (${academy.id})`);
        
        const batch = db.batch();
        let batchCount = 0;
        
        for (const document of documents) {
          const newDocRef = db
            .collection('gyms')
            .doc(academy.id)
            .collection(collectionName)
            .doc(document.id);
          
          // Preparar dados do documento
          const documentData = { ...document };
          delete documentData.id; // Remover o ID dos dados
          
          // Adicionar timestamps se não existirem
          if (!documentData.createdAt) {
            documentData.createdAt = admin.firestore.FieldValue.serverTimestamp();
          }
          if (!documentData.updatedAt) {
            documentData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
          }
          
          batch.set(newDocRef, documentData);
          batchCount++;
          
          // Commit batch a cada 500 operações (limite do Firestore)
          if (batchCount >= 500) {
            await batch.commit();
            console.log(`✅ Batch de ${batchCount} documentos commitado`);
            batchCount = 0;
          }
        }
        
        // Commit batch restante
        if (batchCount > 0) {
          await batch.commit();
          console.log(`✅ Batch final de ${batchCount} documentos commitado`);
        }
        
        console.log(`✅ Migração de ${collectionName} concluída para academia ${academy.name}`);
      }
    }
    
    console.log('\n🎉 Migração concluída com sucesso!');
    console.log('\n⚠️  IMPORTANTE: Após verificar que tudo está funcionando corretamente,');
    console.log('você pode executar o script de limpeza para remover as coleções globais antigas.');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  }
}

/**
 * Script para limpar coleções globais antigas (EXECUTE APENAS APÓS VERIFICAR QUE A MIGRAÇÃO FOI BEM-SUCEDIDA)
 */
async function cleanupGlobalCollections() {
  console.log('🧹 Iniciando limpeza de coleções globais antigas...');
  
  const collections = ['modalities', 'plans', 'announcements', 'graduation_levels'];
  
  for (const collectionName of collections) {
    console.log(`🗑️ Removendo coleção global: ${collectionName}`);
    
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    if (snapshot.docs.length > 0) {
      await batch.commit();
      console.log(`✅ ${snapshot.docs.length} documentos removidos de /${collectionName}`);
    } else {
      console.log(`⚠️ Nenhum documento encontrado em /${collectionName}`);
    }
  }
  
  console.log('🎉 Limpeza concluída!');
}

/**
 * Verificar integridade da migração
 */
async function verifyMigration() {
  console.log('🔍 Verificando integridade da migração...');
  
  const gymsSnapshot = await db.collection('gyms').get();
  const collections = ['modalities', 'plans', 'announcements', 'graduation_levels'];
  
  for (const gymDoc of gymsSnapshot.docs) {
    const gymData = gymDoc.data();
    console.log(`\n🏢 Academia: ${gymData.name} (${gymDoc.id})`);
    
    for (const collectionName of collections) {
      const subcollectionSnapshot = await db
        .collection('gyms')
        .doc(gymDoc.id)
        .collection(collectionName)
        .get();
      
      console.log(`  📋 ${collectionName}: ${subcollectionSnapshot.docs.length} documentos`);
    }
  }
  
  console.log('\n✅ Verificação concluída!');
}

// Executar script baseado no argumento da linha de comando
const command = process.argv[2];

switch (command) {
  case 'migrate':
    migrateGlobalCollections()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Erro:', error);
        process.exit(1);
      });
    break;
    
  case 'cleanup':
    console.log('⚠️  ATENÇÃO: Esta operação irá DELETAR permanentemente as coleções globais antigas!');
    console.log('Execute apenas se você verificou que a migração foi bem-sucedida.');
    console.log('Digite "yes" para confirmar:');
    
    process.stdin.once('data', (data) => {
      const input = data.toString().trim();
      if (input === 'yes') {
        cleanupGlobalCollections()
          .then(() => process.exit(0))
          .catch(error => {
            console.error('Erro:', error);
            process.exit(1);
          });
      } else {
        console.log('Operação cancelada.');
        process.exit(0);
      }
    });
    break;
    
  case 'verify':
    verifyMigration()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Erro:', error);
        process.exit(1);
      });
    break;
    
  default:
    console.log('Uso:');
    console.log('  node migrate-global-collections.js migrate  - Migrar coleções globais');
    console.log('  node migrate-global-collections.js verify   - Verificar migração');
    console.log('  node migrate-global-collections.js cleanup  - Limpar coleções antigas (CUIDADO!)');
    process.exit(1);
}
