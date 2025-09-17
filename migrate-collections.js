#!/usr/bin/env node

// Data migration script to restructure Firestore collections
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'academia-app-5cf79'
});

const db = admin.firestore();

// Collection mapping: old name -> new name
const COLLECTION_MAPPINGS = {
  'alunos': 'students',
  'instrutores': 'instructors', 
  'turmas': 'classes',
  'pagamentos': 'payments',
  'planos': 'plans',
  'eventRegistrations': 'event_registrations'
};

async function migrateCollections() {
  try {
    console.log('🚀 Iniciando migração de coleções...');
    
    // Get all gyms
    const gymsSnapshot = await db.collection('gyms').get();
    console.log(`📊 Encontradas ${gymsSnapshot.size} academias para migrar`);
    
    let totalMigrated = 0;
    let totalErrors = 0;
    
    for (const gymDoc of gymsSnapshot.docs) {
      const gymId = gymDoc.id;
      const gymData = gymDoc.data();
      
      console.log(`\n🏢 Migrando academia: ${gymData.name || gymId}`);
      
      // Migrate each collection mapping
      for (const [oldName, newName] of Object.entries(COLLECTION_MAPPINGS)) {
        try {
          console.log(`  📁 Migrando ${oldName} -> ${newName}...`);
          
          const oldCollectionRef = db.collection('gyms').doc(gymId).collection(oldName);
          const newCollectionRef = db.collection('gyms').doc(gymId).collection(newName);
          
          const oldDocsSnapshot = await oldCollectionRef.get();
          
          if (oldDocsSnapshot.empty) {
            console.log(`    ℹ️  Coleção ${oldName} vazia, pulando...`);
            continue;
          }
          
          console.log(`    📄 Encontrados ${oldDocsSnapshot.size} documentos em ${oldName}`);
          
          const batch = db.batch();
          let batchCount = 0;
          
          for (const doc of oldDocsSnapshot.docs) {
            const docData = doc.data();
            
            // Create document in new collection
            const newDocRef = newCollectionRef.doc(doc.id);
            batch.set(newDocRef, docData);
            
            // Mark old document for deletion (we'll do this in a separate step)
            // For now, just copy the data
            
            batchCount++;
            
            // Firestore batch limit is 500 operations
            if (batchCount >= 450) {
              await batch.commit();
              console.log(`    ✅ Batch de ${batchCount} documentos migrado`);
              batchCount = 0;
            }
          }
          
          // Commit remaining documents
          if (batchCount > 0) {
            await batch.commit();
            console.log(`    ✅ Batch final de ${batchCount} documentos migrado`);
          }
          
          console.log(`    🎉 Migração de ${oldName} -> ${newName} concluída (${oldDocsSnapshot.size} docs)`);
          totalMigrated += oldDocsSnapshot.size;
          
        } catch (error) {
          console.error(`    ❌ Erro ao migrar ${oldName}:`, error.message);
          totalErrors++;
        }
      }
    }
    
    console.log(`\n🎉 Migração concluída!`);
    console.log(`✅ Total de documentos migrados: ${totalMigrated}`);
    console.log(`❌ Total de erros: ${totalErrors}`);
    
    console.log(`\n⚠️  PRÓXIMOS PASSOS:`);
    console.log(`1. Teste a aplicação com as novas coleções`);
    console.log(`2. Atualize o código da aplicação para usar os novos nomes`);
    console.log(`3. Execute o script de limpeza para remover coleções antigas`);
    console.log(`4. Implante as novas regras de segurança`);
    
  } catch (error) {
    console.error('❌ Erro geral na migração:', error);
  }
}

// Function to clean up old collections (run after testing)
async function cleanupOldCollections() {
  console.log('🧹 Iniciando limpeza de coleções antigas...');
  console.log('⚠️  ATENÇÃO: Esta operação irá DELETAR as coleções antigas!');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer = await new Promise((resolve) => {
    rl.question('Tem certeza que deseja continuar? (digite "CONFIRMO" para continuar): ', resolve);
  });
  
  rl.close();
  
  if (answer !== 'CONFIRMO') {
    console.log('❌ Operação cancelada');
    return;
  }
  
  try {
    const gymsSnapshot = await db.collection('gyms').get();
    
    for (const gymDoc of gymsSnapshot.docs) {
      const gymId = gymDoc.id;
      
      for (const oldName of Object.keys(COLLECTION_MAPPINGS)) {
        try {
          const oldCollectionRef = db.collection('gyms').doc(gymId).collection(oldName);
          const oldDocsSnapshot = await oldCollectionRef.get();
          
          if (!oldDocsSnapshot.empty) {
            console.log(`🗑️  Deletando ${oldDocsSnapshot.size} documentos de ${oldName}...`);
            
            const batch = db.batch();
            oldDocsSnapshot.docs.forEach(doc => {
              batch.delete(doc.ref);
            });
            
            await batch.commit();
            console.log(`✅ Coleção ${oldName} limpa`);
          }
        } catch (error) {
          console.error(`❌ Erro ao limpar ${oldName}:`, error.message);
        }
      }
    }
    
    console.log('🎉 Limpeza concluída!');
    
  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
  }
}

// Main execution
const command = process.argv[2];

if (command === 'migrate') {
  migrateCollections()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
} else if (command === 'cleanup') {
  cleanupOldCollections()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
} else {
  console.log('📋 Uso:');
  console.log('  node migrate-collections.js migrate  - Migrar dados para novas coleções');
  console.log('  node migrate-collections.js cleanup  - Limpar coleções antigas (após teste)');
  process.exit(1);
}
