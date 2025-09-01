#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuração do Firebase...\n');

// Verificar se o google-services.json existe
const googleServicesPath = path.join(__dirname, '..', 'google-services.json');
if (fs.existsSync(googleServicesPath)) {
  console.log('✅ google-services.json encontrado');
  
  try {
    const googleServices = JSON.parse(fs.readFileSync(googleServicesPath, 'utf8'));
    if (googleServices.client && googleServices.client[0] && googleServices.client[0].client_info && googleServices.client[0].client_info.android_client_info) {
      const packageName = googleServices.client[0].client_info.android_client_info.package_name;
      console.log(`📦 Package name: ${packageName}`);
      
      // Verificar se o package name está correto
      if (packageName === 'com.c1c3ru.academiaapp') {
        console.log('✅ Package name correto');
      } else {
        console.log('❌ Package name incorreto. Deve ser: com.c1c3ru.academiaapp');
      }
    } else {
      console.log('❌ Estrutura do google-services.json inválida');
    }
  } catch (error) {
    console.log('❌ Erro ao ler google-services.json:', error.message);
  }
} else {
  console.log('❌ google-services.json não encontrado');
}

// Verificar se o firebase.js existe
const firebasePath = path.join(__dirname, '..', 'src', 'services', 'firebase.js');
if (fs.existsSync(firebasePath)) {
  console.log('✅ firebase.js encontrado');
  
  const firebaseContent = fs.readFileSync(firebasePath, 'utf8');
  
  // Verificar se tem tratamento de erro
  if (firebaseContent.includes('try {') && firebaseContent.includes('catch (error)')) {
    console.log('✅ Tratamento de erro implementado');
  } else {
    console.log('❌ Tratamento de erro não encontrado');
  }
  
  // Verificar se tem configuração hardcoded
  if (firebaseContent.includes('apiKey: "AIzaSyA_hzFPt9hUITlMq9BrsJuxAdzycVR3AEI"')) {
    console.log('✅ Configuração do Firebase encontrada');
  } else {
    console.log('❌ Configuração do Firebase não encontrada');
  }
} else {
  console.log('❌ firebase.js não encontrado');
}

// Verificar se o FirebaseInitializer existe
const initializerPath = path.join(__dirname, '..', 'src', 'components', 'FirebaseInitializer.js');
if (fs.existsSync(initializerPath)) {
  console.log('✅ FirebaseInitializer.js encontrado');
} else {
  console.log('❌ FirebaseInitializer.js não encontrado');
}

// Verificar se o App.js usa o FirebaseInitializer
const appPath = path.join(__dirname, '..', 'App.js');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  if (appContent.includes('FirebaseInitializer')) {
    console.log('✅ App.js usa FirebaseInitializer');
  } else {
    console.log('❌ App.js não usa FirebaseInitializer');
  }
} else {
  console.log('❌ App.js não encontrado');
}

// Verificar package.json
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const firebaseVersion = packageJson.dependencies.firebase;
  console.log(`📦 Firebase versão: ${firebaseVersion}`);
  
  if (firebaseVersion && firebaseVersion.startsWith('^12')) {
    console.log('✅ Versão do Firebase compatível');
  } else {
    console.log('❌ Versão do Firebase pode estar desatualizada');
  }
} else {
  console.log('❌ package.json não encontrado');
}

console.log('\n🎯 Próximos passos:');
console.log('1. Execute: npm install');
console.log('2. Execute: npx expo start --clear');
console.log('3. Teste o app no dispositivo/emulador');
console.log('4. Verifique os logs do console para erros do Firebase'); 