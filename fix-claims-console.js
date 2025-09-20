// Script para executar no Console do Firebase (Functions)
// Este script corrige os claims do usuário cicero.silva@ifce.edu.br

const admin = require('firebase-admin');

// Função para corrigir claims
async function fixUserClaims() {
  try {
    console.log('🔧 Iniciando correção dos claims...');
    
    const userEmail = 'cicero.silva@ifce.edu.br';
    const correctAcademiaId = 'yCRtgOHYvw7kiHmF12aw';
    const incorrectAcademiaId = 'RBPHlgc39EXphF47Qzql';
    
    // 1. Buscar usuário por email
    console.log(`🔍 Buscando usuário: ${userEmail}`);
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    console.log(`✅ Usuário encontrado: ${userRecord.uid}`);
    
    // 2. Verificar claims atuais
    console.log('📋 Claims atuais:', userRecord.customClaims);
    
    if (userRecord.customClaims?.academiaId === incorrectAcademiaId) {
      console.log(`🔧 Corrigindo academiaId de ${incorrectAcademiaId} para ${correctAcademiaId}`);
      
      // 3. Definir novos claims
      const newClaims = {
        role: 'instructor',
        academiaId: correctAcademiaId,
        hasAcademiaId: true,
        hasRole: true
      };
      
      // 4. Atualizar claims
      await admin.auth().setCustomUserClaims(userRecord.uid, newClaims);
      console.log('✅ Claims atualizados com sucesso!');
      console.log('📋 Novos claims:', newClaims);
      
      // 5. Verificar se foi aplicado
      const updatedUser = await admin.auth().getUser(userRecord.uid);
      console.log('🔍 Claims após atualização:', updatedUser.customClaims);
      
      console.log('🎉 Correção concluída!');
      console.log('📝 O usuário deve fazer logout e login novamente para aplicar as mudanças.');
      
    } else if (userRecord.customClaims?.academiaId === correctAcademiaId) {
      console.log('✅ Claims já estão corretos!');
    } else {
      console.log(`⚠️ AcademiaId atual: ${userRecord.customClaims?.academiaId}`);
      console.log(`🔧 Definindo para: ${correctAcademiaId}`);
      
      const newClaims = {
        role: 'instructor',
        academiaId: correctAcademiaId,
        hasAcademiaId: true,
        hasRole: true
      };
      
      await admin.auth().setCustomUserClaims(userRecord.uid, newClaims);
      console.log('✅ Claims definidos com sucesso!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir claims:', error);
  }
}

// Executar a função
fixUserClaims();
