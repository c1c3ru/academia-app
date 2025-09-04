
#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧪 Testando build local do Academia App...\n');

try {
  // Verificar se o projeto compila
  console.log('📦 Verificando dependências...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\n🔍 Verificando sintaxe...');
  execSync('npx expo doctor', { stdio: 'inherit' });
  
  console.log('\n🏗️ Testando build web...');
  execSync('npx expo export --platform web', { stdio: 'inherit' });
  
  console.log('\n✅ Todos os testes passaram!');
  console.log('\n📱 Para testar no Android:');
  console.log('   npx expo run:android');
  console.log('\n🌐 Para testar na web:');
  console.log('   npx expo start --web');
  
} catch (error) {
  console.error('\n❌ Erro nos testes:', error.message);
  console.log('\n🔧 Verifique os erros acima e corrija antes de fazer o build.');
  process.exit(1);
}
