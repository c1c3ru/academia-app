#!/usr/bin/env node

// Script direto para corrigir Custom Claims usando Firebase Admin SDK
const admin = require('firebase-admin');

// Inicializar Firebase Admin com as credenciais do projeto
try {
  admin.initializeApp({
    projectId: 'academia-app-5cf79'
  });
  console.log('✅ Firebase Admin inicializado');
} catch (error) {
  console.log('ℹ️ Firebase Admin já inicializado');
}

async function fixUserClaims() {
  const userId = 'EXjQ5utfSGRBd9pQJVFmts5DxtC3';
  const claims = {
    role: 'admin',
    "academiaId": "yCRtgOHYvw7kiHmF12aw"
  };

  try {
    console.log('🔧 Definindo Custom Claims...');
    console.log(`   Usuário: ${userId}`);
    console.log(`   Claims: ${JSON.stringify(claims, null, 2)}`);

    // Definir Custom Claims
    await admin.auth().setCustomUserClaims(userId, claims);
    console.log('✅ Custom Claims definidos com sucesso!');

    // Atualizar timestamp no Firestore
    await admin.firestore().collection('users').doc(userId).update({
      claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Timestamp atualizado no Firestore');

    // Verificar se funcionou
    const userRecord = await admin.auth().getUser(userId);
    console.log('🔍 Claims verificados:', userRecord.customClaims);

    console.log('\n🎉 Correção concluída com sucesso!');
    console.log('💡 Recarregue o app principal para testar');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

// Executar
fixUserClaims()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
