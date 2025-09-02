
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build Android para Academia App...\n');

// Verificar se EAS CLI está instalado
try {
  execSync('eas --version', { stdio: 'ignore' });
  console.log('✅ EAS CLI encontrado');
} catch (error) {
  console.log('📦 Instalando EAS CLI...');
  execSync('npm install -g @expo/eas-cli', { stdio: 'inherit' });
}

// Verificar se está logado no EAS
try {
  execSync('eas whoami', { stdio: 'ignore' });
  console.log('✅ Logado no EAS');
} catch (error) {
  console.log('🔐 Faça login no EAS primeiro:');
  console.log('   eas login');
  process.exit(1);
}

// Verificar configurações do Firebase
const firebasePath = path.join(__dirname, '..', 'google-services.json');
if (!fs.existsSync(firebasePath)) {
  console.log('❌ google-services.json não encontrado!');
  console.log('   Configure o Firebase primeiro.');
  process.exit(1);
}

console.log('✅ Configurações verificadas\n');

// Menu de opções
const buildType = process.argv[2] || 'production';

console.log('📱 Tipos de build disponíveis:');
console.log('1. development - APK para testes');
console.log('2. preview - APK para review');
console.log('3. production - AAB para Google Play Store');
console.log('4. production-apk - APK para distribuição manual\n');

try {
  console.log(`🏗️ Iniciando build: ${buildType}`);
  
  // Executar build
  const buildCommand = `eas build --platform android --profile ${buildType} --non-interactive`;
  console.log(`Executando: ${buildCommand}\n`);
  
  execSync(buildCommand, { stdio: 'inherit' });
  
  console.log('\n🎉 Build concluído com sucesso!');
  console.log('\n📋 Próximos passos:');
  
  if (buildType === 'production') {
    console.log('1. Baixe o arquivo AAB gerado');
    console.log('2. Faça upload no Google Play Console');
    console.log('3. Configure a página da loja');
    console.log('4. Envie para review');
  } else {
    console.log('1. Baixe o arquivo APK gerado');
    console.log('2. Instale no dispositivo para testes');
    console.log('3. Teste todas as funcionalidades');
  }
  
} catch (error) {
  console.error('\n❌ Erro durante o build:', error.message);
  process.exit(1);
}
