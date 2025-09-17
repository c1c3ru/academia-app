// Script para executar no console do navegador quando logado no app
// Este script usa as funções já deployadas para corrigir os Custom Claims

console.log('🔧 Iniciando correção de Custom Claims...');

// Importar Firebase Functions
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// Função para migrar todos os usuários
async function migrateAllUsers() {
  try {
    console.log('📊 Executando migração completa...');
    
    const migrateUsers = httpsCallable(functions, 'migrateExistingUsers');
    const result = await migrateUsers();
    
    console.log('✅ Migração concluída:', result.data);
    console.log(`📈 Usuários migrados: ${result.data.migratedUsers}`);
    
    return result.data;
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  }
}

// Função para corrigir usuário específico
async function fixSpecificUser(userId) {
  try {
    console.log(`🔄 Corrigindo claims para usuário: ${userId}`);
    
    const fixUserClaims = httpsCallable(functions, 'fixUserClaims');
    const result = await fixUserClaims({ userId });
    
    console.log('✅ Claims corrigidos:', result.data);
    
    return result.data;
  } catch (error) {
    console.error('❌ Erro ao corrigir claims:', error);
    throw error;
  }
}

// Executar migração automática
console.log('🚀 Executando migração automática...');
migrateAllUsers()
  .then((result) => {
    console.log('🎉 Migração concluída com sucesso!');
    console.log('💡 Faça logout/login para aplicar as mudanças.');
  })
  .catch((error) => {
    console.error('💥 Erro na migração automática:', error);
    console.log('📋 Tente a correção manual via Console Firebase.');
  });

// Exportar funções para uso manual
window.migrateAllUsers = migrateAllUsers;
window.fixSpecificUser = fixSpecificUser;
