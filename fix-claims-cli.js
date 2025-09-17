#!/usr/bin/env node

// Script para corrigir Custom Claims via Firebase CLI
// Execute: node fix-claims-cli.js

const { execSync } = require('child_process');

console.log('🔧 Corrigindo Custom Claims via Firebase CLI...\n');

try {
  // Verificar se está logado
  console.log('🔐 Verificando autenticação...');
  execSync('firebase projects:list', { stdio: 'pipe' });
  console.log('✅ Firebase CLI autenticado\n');

  // Executar correção via Functions Shell
  console.log('🚀 Executando correção...');
  
  const script = `
    const userId = 'EXjQ5utfSGRBd9pQJVFmts5DxtC3';
    const claims = { role: 'admin', academiaId: 'Tgg6tZynnTbQUxeAFJAB' };
    
    admin.auth().setCustomUserClaims(userId, claims)
      .then(() => {
        console.log('✅ Claims definidos:', claims);
        return admin.firestore().collection('users').doc(userId).update({
          claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(() => {
        console.log('✅ Timestamp atualizado');
        process.exit(0);
      })
      .catch(err => {
        console.error('❌ Erro:', err);
        process.exit(1);
      });
  `;

  // Salvar script temporário
  require('fs').writeFileSync('/tmp/fix-claims.js', script);
  
  // Executar via Firebase Functions Shell
  const command = `cd functions && echo "require('/tmp/fix-claims.js')" | firebase functions:shell --non-interactive`;
  
  console.log('Executando comando:', command);
  const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  
  console.log('📋 Resultado:', result);
  console.log('\n🎉 Correção concluída!');
  console.log('💡 Recarregue o app principal para testar');

} catch (error) {
  console.error('❌ Erro na correção:', error.message);
  console.log('\n📋 Use a correção manual via Console Firebase:');
  console.log('https://console.firebase.google.com/project/academia-app-5cf79');
  process.exit(1);
}
