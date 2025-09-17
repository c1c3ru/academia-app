const admin = require('firebase-admin');

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // ou use serviceAccountKey se necessário
  });
}

const db = admin.firestore();

/**
 * Script para migrar coleções globais para subcoleções por academia
 * 
 * Migra:
 * - classes -> gyms/{academiaId}/classes
 * - graduations -> gyms/{academiaId}/graduations  
 * - invites -> gyms/{academiaId}/invites
 * - modalities -> gyms/{academiaId}/modalities
 * - payments -> gyms/{academiaId}/payments
 * - plans -> gyms/{academiaId}/plans
 */

async function migrateCollection(collectionName, getAcademiaId) {
  console.log(`\n🔄 Migrando coleção: ${collectionName}`);
  
  try {
    const snapshot = await db.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log(`✅ Coleção ${collectionName} está vazia, nada para migrar`);
      return;
    }

    let migratedCount = 0;
    let errorCount = 0;
    
    for (const doc of snapshot.docs) {
      try {
        const data = doc.data();
        const academiaId = getAcademiaId(data);
        
        if (!academiaId) {
          console.warn(`⚠️  Documento ${doc.id} não tem academiaId válido:`, data);
          errorCount++;
          continue;
        }

        // Criar documento na subcoleção
        const subcollectionRef = db.collection(`gyms/${academiaId}/${collectionName}`).doc(doc.id);
        await subcollectionRef.set(data);
        
        console.log(`✅ Migrado ${doc.id} para gyms/${academiaId}/${collectionName}`);
        migratedCount++;
        
        // Pequena pausa para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`❌ Erro ao migrar documento ${doc.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Resumo da migração de ${collectionName}:`);
    console.log(`   ✅ Migrados: ${migratedCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    
  } catch (error) {
    console.error(`❌ Erro ao migrar coleção ${collectionName}:`, error);
  }
}

async function deleteGlobalCollection(collectionName) {
  console.log(`\n🗑️  Deletando coleção global: ${collectionName}`);
  
  try {
    const snapshot = await db.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log(`✅ Coleção ${collectionName} já está vazia`);
      return;
    }

    const batch = db.batch();
    let deleteCount = 0;
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    
    await batch.commit();
    console.log(`✅ Deletados ${deleteCount} documentos da coleção ${collectionName}`);
    
  } catch (error) {
    console.error(`❌ Erro ao deletar coleção ${collectionName}:`, error);
  }
}

async function main() {
  console.log('🚀 Iniciando migração de coleções para subcoleções...\n');
  
  // 1. Migrar classes
  await migrateCollection('classes', (data) => {
    return data.academiaId || data.gymId;
  });
  
  // 2. Migrar graduations
  await migrateCollection('graduations', (data) => {
    return data.academiaId || data.gymId;
  });
  
  // 3. Migrar invites
  await migrateCollection('invites', (data) => {
    return data.academiaId || data.gymId;
  });
  
  // 4. Migrar modalities
  await migrateCollection('modalities', (data) => {
    return data.academiaId || data.gymId;
  });
  
  // 5. Migrar payments
  await migrateCollection('payments', (data) => {
    return data.academiaId || data.gymId;
  });
  
  // 6. Migrar plans
  await migrateCollection('plans', (data) => {
    return data.academiaId || data.gymId;
  });
  
  console.log('\n✅ Migração concluída!');
  console.log('\n⚠️  IMPORTANTE: Verifique os dados migrados antes de deletar as coleções globais.');
  console.log('Para deletar as coleções globais após verificação, execute: node migrate-collections-to-subcollections.js --delete');
  
  // Se flag --delete foi passada, deletar coleções globais
  if (process.argv.includes('--delete')) {
    console.log('\n🗑️  Deletando coleções globais...');
    
    await deleteGlobalCollection('classes');
    await deleteGlobalCollection('graduations');
    await deleteGlobalCollection('invites');
    await deleteGlobalCollection('modalities');
    await deleteGlobalCollection('payments');
    await deleteGlobalCollection('plans');
    
    console.log('\n✅ Coleções globais deletadas!');
  }
}

// Executar migração
main().catch(console.error);
