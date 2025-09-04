
#!/usr/bin/env node

console.log('🔍 Verificando compatibilidade do app...\n');

const fs = require('fs');
const path = require('path');

// Verificar dependências necessárias
console.log('📦 Verificando dependências...');

const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const requiredDeps = {
  'react-native': 'Para mobile',
  'react-dom': 'Para web',
  'react-native-web': 'Para compatibilidade web',
  '@react-navigation/native': 'Para navegação',
  '@react-navigation/stack': 'Para navegação stack',
  '@react-navigation/bottom-tabs': 'Para navegação tabs',
  '@react-navigation/drawer': 'Para navegação drawer',
  'react-native-paper': 'Para UI components',
  'expo': 'Para desenvolvimento',
  'firebase': 'Para backend',
};

console.log('✅ Dependências verificadas:');
Object.entries(requiredDeps).forEach(([dep, description]) => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies?.[dep]) {
    console.log(`  ✅ ${dep}: ${packageJson.dependencies[dep] || packageJson.devDependencies[dep]} - ${description}`);
  } else {
    console.log(`  ❌ ${dep}: Não encontrado - ${description}`);
  }
});

// Verificar arquivos essenciais
console.log('\n📁 Verificando arquivos essenciais...');

const essentialFiles = [
  'App.js',
  'src/utils/platform.js',
  'src/hooks/useResponsive.js',
  'src/components/ResponsiveContainer.js',
  'src/components/WebCompatibility.js',
  'src/services/firebase.js',
  'src/navigation/AppNavigator.js',
];

essentialFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, '..', file))) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - Arquivo não encontrado`);
  }
});

// Verificar configurações do Expo
console.log('\n⚙️ Verificando configurações do Expo...');

const appJsonPath = path.join(__dirname, '..', 'app.json');
if (fs.existsSync(appJsonPath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  console.log('  ✅ app.json encontrado');
  
  if (appJson.expo) {
    console.log('  ✅ Configuração Expo presente');
    
    // Verificar plataformas suportadas
    const platforms = appJson.expo.platforms || ['ios', 'android', 'web'];
    console.log(`  📱 Plataformas: ${platforms.join(', ')}`);
    
    if (platforms.includes('web')) {
      console.log('  ✅ Suporte web habilitado');
    } else {
      console.log('  ⚠️ Suporte web não habilitado');
    }
  }
} else {
  console.log('  ❌ app.json não encontrado');
}

// Verificar Firebase
console.log('\n🔥 Verificando configuração Firebase...');

const firebasePath = path.join(__dirname, '..', 'src', 'services', 'firebase.js');
if (fs.existsSync(firebasePath)) {
  const firebaseContent = fs.readFileSync(firebasePath, 'utf8');
  
  if (firebaseContent.includes('Platform.OS')) {
    console.log('  ✅ Detecção de plataforma implementada');
  } else {
    console.log('  ⚠️ Detecção de plataforma não encontrada');
  }
  
  if (firebaseContent.includes('initializeApp')) {
    console.log('  ✅ Inicialização Firebase presente');
  } else {
    console.log('  ❌ Inicialização Firebase não encontrada');
  }
} else {
  console.log('  ❌ Arquivo Firebase não encontrado');
}

console.log('\n🎯 Próximos passos para garantir compatibilidade:');
console.log('1. Execute: npm install');
console.log('2. Para web: npx expo start --web');
console.log('3. Para mobile: npx expo start');
console.log('4. Teste em diferentes dispositivos e orientações');
console.log('5. Verifique responsividade em diferentes tamanhos de tela');

console.log('\n✨ Verificação de compatibilidade concluída!');
