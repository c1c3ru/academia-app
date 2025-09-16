#!/usr/bin/env node

/**
 * Script simples para verificar o estado atual e orientar a migração manual
 */

const { execSync } = require('child_process');

const PROJECT_ID = 'academia-app-5cf79';
const COLLECTIONS = ['modalities', 'plans', 'announcements', 'graduation_levels'];

function runFirebaseCommand(command) {
  try {
    const result = execSync(`firebase ${command} --project ${PROJECT_ID}`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return result.trim();
  } catch (error) {
    return null;
  }
}

function checkCollectionExists(collectionName) {
  console.log(`📋 Verificando coleção: ${collectionName}`);
  
  // Tentar listar documentos da coleção
  const result = runFirebaseCommand(`firestore:get ${collectionName}`);
  
  if (result === null) {
    console.log(`   ℹ️ Coleção ${collectionName} não encontrada ou vazia`);
    return false;
  } else if (result.includes('No documents found')) {
    console.log(`   ℹ️ Coleção ${collectionName} existe mas está vazia`);
    return false;
  } else {
    console.log(`   ✅ Coleção ${collectionName} contém dados`);
    return true;
  }
}

function checkAcademies() {
  console.log('🏢 Verificando academias...');
  
  const result = runFirebaseCommand('firestore:get gyms');
  
  if (result === null || result.includes('No documents found')) {
    console.log('   ⚠️ Nenhuma academia encontrada');
    return false;
  } else {
    console.log('   ✅ Academias encontradas');
    return true;
  }
}

function main() {
  console.log('🔍 Verificação do Estado Atual');
  console.log('==============================');
  console.log(`📋 Projeto: ${PROJECT_ID}\n`);
  
  // Verificar autenticação
  console.log('🔐 Verificando autenticação...');
  const authResult = runFirebaseCommand('projects:list');
  if (authResult === null) {
    console.log('❌ Firebase CLI não autenticado');
    console.log('💡 Execute: firebase login');
    process.exit(1);
  }
  console.log('✅ Firebase CLI autenticado\n');
  
  // Verificar academias
  const hasAcademies = checkAcademies();
  
  // Verificar coleções globais
  console.log('\n📋 Verificando coleções globais:');
  const globalCollections = {};
  
  for (const collection of COLLECTIONS) {
    globalCollections[collection] = checkCollectionExists(collection);
  }
  
  // Relatório e orientações
  console.log('\n📊 RELATÓRIO:');
  console.log('=============');
  
  if (!hasAcademies) {
    console.log('❌ PROBLEMA: Nenhuma academia encontrada');
    console.log('💡 SOLUÇÃO: Crie pelo menos uma academia antes da migração');
    console.log('   - Use a aplicação para criar uma academia');
    console.log('   - Ou use a Cloud Function createAcademy');
    process.exit(1);
  }
  
  const hasGlobalData = Object.values(globalCollections).some(exists => exists);
  
  if (!hasGlobalData) {
    console.log('✅ STATUS: Nenhuma coleção global com dados encontrada');
    console.log('💡 CONCLUSÃO: Migração não necessária ou já foi executada');
    console.log('\n🎉 Seu sistema já está usando a nova arquitetura!');
  } else {
    console.log('⚠️ STATUS: Coleções globais com dados encontradas');
    console.log('💡 AÇÃO NECESSÁRIA: Migração manual requerida');
    
    console.log('\n📋 COLEÇÕES QUE PRECISAM SER MIGRADAS:');
    for (const [collection, exists] of Object.entries(globalCollections)) {
      if (exists) {
        console.log(`   - ${collection}`);
      }
    }
    
    console.log('\n🔧 OPÇÕES DE MIGRAÇÃO:');
    console.log('1. MIGRAÇÃO VIA CONSOLE FIREBASE:');
    console.log('   - Acesse: https://console.firebase.google.com/project/academia-app-5cf79/firestore');
    console.log('   - Copie manualmente os documentos das coleções globais');
    console.log('   - Para subcoleções em: gyms/{academiaId}/{collection}');
    
    console.log('\n2. MIGRAÇÃO VIA CÓDIGO CLIENTE:');
    console.log('   - Implemente uma função de migração no app');
    console.log('   - Execute uma vez para cada admin');
    
    console.log('\n3. AGUARDAR MIGRAÇÃO AUTOMÁTICA:');
    console.log('   - Os dados serão migrados conforme os usuários usam o app');
    console.log('   - Modalidades, planos etc. serão recriados nas subcoleções');
  }
  
  console.log('\n🔍 PRÓXIMOS PASSOS:');
  console.log('1. Teste a aplicação com a nova arquitetura');
  console.log('2. Verifique se as Cloud Functions estão funcionando');
  console.log('3. Monitore os logs para erros');
  console.log('4. Execute este script novamente após usar a aplicação');
  
  console.log('\n💡 COMANDOS ÚTEIS:');
  console.log('- Logs das functions: firebase functions:log --project academia-app-5cf79');
  console.log('- Console Firestore: https://console.firebase.google.com/project/academia-app-5cf79/firestore');
  console.log('- Verificar novamente: node scripts/simple-migration-check.js');
}

if (require.main === module) {
  main();
}
