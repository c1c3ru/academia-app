// Script para corrigir o usuário correto
const { execSync } = require('child_process');

console.log('🔧 Corrigindo Custom Claims para o usuário correto...');
console.log('📋 Usuário: rnrDk4ZCuERLDlSNAiYmMGS431T2 (cicerosilva.ifce@gmail.com)');

try {
  // Usar Firebase CLI para definir claims diretamente
  const command = `firebase functions:shell --non-interactive`;
  
  const script = `
admin.auth().setCustomUserClaims('rnrDk4ZCuERLDlSNAiYmMGS431T2', {
  role: 'admin',
  academiaId: 'Tgg6tZynnTbQUxeAFJAB'
}).then(() => {
  console.log('✅ Claims definidos para rnrDk4ZCuERLDlSNAiYmMGS431T2');
  process.exit(0);
}).catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
`;

  console.log('📝 Execute manualmente no Firebase Functions Shell:');
  console.log('1. cd functions');
  console.log('2. firebase functions:shell');
  console.log('3. Cole este código:');
  console.log(script);

} catch (error) {
  console.error('❌ Erro:', error.message);
}
