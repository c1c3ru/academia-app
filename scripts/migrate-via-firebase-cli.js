#!/usr/bin/env node

/**
 * Script de migração usando Firebase CLI
 * Este script usa as credenciais já autenticadas do Firebase CLI
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurações
const PROJECT_ID = 'academia-app-5cf79'; // Baseado no output do deploy
const COLLECTIONS_TO_MIGRATE = ['modalities', 'plans', 'announcements', 'graduation_levels'];

/**
 * Executa comando Firebase e retorna o resultado
 */
function runFirebaseCommand(command) {
  try {
    const result = execSync(`firebase ${command} --project ${PROJECT_ID}`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return result;
  } catch (error) {
    console.error(`Erro ao executar comando Firebase: ${error.message}`);
    throw error;
  }
}

/**
 * Busca documentos de uma coleção usando Firebase CLI
 */
function getCollectionData(collectionName) {
  console.log(`📋 Buscando dados da coleção: ${collectionName}`);
  
  try {
    // Usar firestore:get para buscar dados
    const command = `firestore:get ${collectionName} --format=json`;
    const result = runFirebaseCommand(command);
    
    if (!result.trim()) {
      console.log(`   ℹ️ Coleção ${collectionName} está vazia`);
      return [];
    }
    
    const data = JSON.parse(result);
    console.log(`   ✅ Encontrados ${data.length} documentos em ${collectionName}`);
    return data;
    
  } catch (error) {
    console.log(`   ⚠️ Erro ao buscar ${collectionName}: ${error.message}`);
    return [];
  }
}

/**
 * Busca todas as academias
 */
function getAcademies() {
  console.log('🏢 Buscando academias...');
  
  try {
    const command = `firestore:get gyms --format=json`;
    const result = runFirebaseCommand(command);
    
    if (!result.trim()) {
      console.log('   ⚠️ Nenhuma academia encontrada');
      return [];
    }
    
    const academies = JSON.parse(result);
    console.log(`   ✅ Encontradas ${academies.length} academias`);
    return academies;
    
  } catch (error) {
    console.error(`   ❌ Erro ao buscar academias: ${error.message}`);
    return [];
  }
}

/**
 * Cria documento em subcoleção usando Firebase CLI
 */
function createSubcollectionDocument(academyId, collectionName, docId, data) {
  try {
    // Criar arquivo temporário com os dados
    const tempFile = path.join(__dirname, `temp_${Date.now()}.json`);
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
    
    // Usar firestore:set para criar o documento
    const docPath = `gyms/${academyId}/${collectionName}/${docId}`;
    const command = `firestore:set ${docPath} ${tempFile}`;
    
    runFirebaseCommand(command);
    
    // Limpar arquivo temporário
    fs.unlinkSync(tempFile);
    
    return true;
  } catch (error) {
    console.error(`     ❌ Erro ao criar documento ${docId}: ${error.message}`);
    return false;
  }
}

/**
 * Migra uma coleção para todas as academias
 */
async function migrateCollection(collectionName, academies) {
  console.log(`\n🔄 Migrando coleção: ${collectionName}`);
  
  // Buscar dados da coleção global
  const globalDocs = getCollectionData(collectionName);
  
  if (globalDocs.length === 0) {
    console.log(`   ℹ️ Nenhum documento para migrar em ${collectionName}`);
    return { success: true, migrated: 0 };
  }
  
  let totalMigrated = 0;
  let errors = 0;
  
  // Para cada academia, copiar os documentos
  for (const academy of academies) {
    console.log(`   🏢 Migrando para academia: ${academy.name || academy.id}`);
    
    for (const doc of globalDocs) {
      const docData = {
        ...doc,
        academiaId: academy.id,
        migratedAt: new Date().toISOString(),
        migratedFrom: `global_${collectionName}`
      };
      
      // Remover campos que podem causar conflito
      delete docData.id;
      
      const success = createSubcollectionDocument(
        academy.id, 
        collectionName, 
        doc.id || `migrated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        docData
      );
      
      if (success) {
        totalMigrated++;
        console.log(`     ✅ Documento migrado: ${doc.id || 'sem-id'}`);
      } else {
        errors++;
      }
    }
  }
  
  return { 
    success: errors === 0, 
    migrated: totalMigrated, 
    errors: errors,
    globalDocs: globalDocs.length 
  };
}

/**
 * Verifica se a migração foi bem-sucedida
 */
function verifyMigration(academies) {
  console.log('\n🔍 Verificando migração...');
  
  let totalVerified = 0;
  
  for (const academy of academies) {
    console.log(`   🏢 Verificando academia: ${academy.name || academy.id}`);
    
    for (const collectionName of COLLECTIONS_TO_MIGRATE) {
      try {
        const command = `firestore:get gyms/${academy.id}/${collectionName} --format=json`;
        const result = runFirebaseCommand(command);
        
        if (result.trim()) {
          const docs = JSON.parse(result);
          console.log(`     ✅ ${collectionName}: ${docs.length} documentos`);
          totalVerified += docs.length;
        } else {
          console.log(`     ℹ️ ${collectionName}: 0 documentos`);
        }
      } catch (error) {
        console.log(`     ⚠️ ${collectionName}: Erro na verificação`);
      }
    }
  }
  
  console.log(`\n📊 Total de documentos verificados: ${totalVerified}`);
  return totalVerified > 0;
}

/**
 * Remove coleções globais (CUIDADO!)
 */
function cleanupGlobalCollections() {
  console.log('\n🗑️ Limpando coleções globais...');
  console.log('⚠️ ATENÇÃO: Esta operação é irreversível!');
  
  for (const collectionName of COLLECTIONS_TO_MIGRATE) {
    try {
      console.log(`   🗑️ Removendo coleção: ${collectionName}`);
      const command = `firestore:delete ${collectionName} --recursive --yes`;
      runFirebaseCommand(command);
      console.log(`   ✅ Coleção ${collectionName} removida`);
    } catch (error) {
      console.log(`   ❌ Erro ao remover ${collectionName}: ${error.message}`);
    }
  }
}

/**
 * Função principal
 */
function main() {
  const command = process.argv[2] || 'migrate';
  
  console.log('🚀 Script de Migração via Firebase CLI');
  console.log('=====================================');
  console.log(`📋 Projeto: ${PROJECT_ID}`);
  console.log(`🔧 Comando: ${command}\n`);
  
  try {
    // Verificar se Firebase CLI está autenticado
    console.log('🔐 Verificando autenticação...');
    runFirebaseCommand('projects:list');
    console.log('✅ Firebase CLI autenticado\n');
    
    switch (command) {
      case 'migrate':
        console.log('🔄 Iniciando migração completa...\n');
        
        // Buscar academias
        const academies = getAcademies();
        if (academies.length === 0) {
          console.log('❌ Nenhuma academia encontrada. Migração cancelada.');
          process.exit(1);
        }
        
        // Migrar cada coleção
        const results = {};
        for (const collectionName of COLLECTIONS_TO_MIGRATE) {
          results[collectionName] = migrateCollection(collectionName, academies);
        }
        
        // Relatório final
        console.log('\n📊 RELATÓRIO DE MIGRAÇÃO:');
        console.log('========================');
        let totalMigrated = 0;
        let totalErrors = 0;
        
        for (const [collection, result] of Object.entries(results)) {
          console.log(`${collection}: ${result.migrated} migrados, ${result.errors} erros`);
          totalMigrated += result.migrated;
          totalErrors += result.errors;
        }
        
        console.log(`\nTotal: ${totalMigrated} documentos migrados, ${totalErrors} erros`);
        
        if (totalErrors === 0) {
          console.log('\n🎉 Migração concluída com sucesso!');
          console.log('💡 Execute "node migrate-via-firebase-cli.js verify" para verificar');
        } else {
          console.log('\n⚠️ Migração concluída com erros. Verifique os logs acima.');
        }
        break;
        
      case 'verify':
        const academiesForVerify = getAcademies();
        const verified = verifyMigration(academiesForVerify);
        
        if (verified) {
          console.log('\n✅ Verificação concluída - dados migrados encontrados');
          console.log('💡 Execute "node migrate-via-firebase-cli.js cleanup" para limpar coleções globais');
        } else {
          console.log('\n❌ Verificação falhou - nenhum dado migrado encontrado');
        }
        break;
        
      case 'cleanup':
        console.log('\n⚠️ ATENÇÃO: Você está prestes a remover as coleções globais!');
        console.log('Esta operação é IRREVERSÍVEL!');
        console.log('Certifique-se de que a migração foi verificada com sucesso.\n');
        
        // Simular confirmação (em produção, usar readline)
        console.log('🗑️ Executando limpeza...');
        cleanupGlobalCollections();
        console.log('\n✅ Limpeza concluída');
        break;
        
      default:
        console.log('❌ Comando inválido. Use: migrate, verify ou cleanup');
        process.exit(1);
    }
    
  } catch (error) {
    console.error(`\n❌ Erro fatal: ${error.message}`);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}
