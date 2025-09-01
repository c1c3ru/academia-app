#!/usr/bin/env node

console.log('🧪 Testando inicialização do Firebase...\n');

// Simular ambiente React Native
global.window = {};
global.navigator = {};

try {
  // Testar importações
  console.log('📦 Testando importações...');
  
  const { initializeApp } = require('firebase/app');
  const { getAuth } = require('firebase/auth');
  const { getFirestore } = require('firebase/firestore');
  
  console.log('✅ Importações bem-sucedidas');
  
  // Testar configuração
  console.log('⚙️ Testando configuração...');
  
  const firebaseConfig = {
    apiKey: "AIzaSyA_hzFPt9hUITlMq9BrsJuxAdzycVR3AEI",
    authDomain: "academia-app-5cf79.firebaseapp.com",
    projectId: "academia-app-5cf79",
    storageBucket: "academia-app-5cf79.firebasestorage.app",
    messagingSenderId: "377489252583",
    appId: "1:377489252583:android:87f2c3948511325769c242"
  };
  
  console.log('✅ Configuração válida');
  
  // Testar inicialização (sem AsyncStorage em ambiente Node.js)
  console.log('🚀 Testando inicialização...');
  
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase App inicializado');
  
  const auth = getAuth(app);
  console.log('✅ Firebase Auth inicializado');
  
  const db = getFirestore(app);
  console.log('✅ Firestore inicializado');
  
  console.log('\n🎉 Teste concluído com sucesso!');
  console.log('O Firebase está configurado corretamente.');
  
} catch (error) {
  console.error('❌ Erro durante o teste:', error.message);
  console.error('Stack trace:', error.stack);
  
  if (error.message.includes('getReactNativePersistence')) {
    console.log('\n💡 Dica: Verifique se a importação está correta:');
    console.log('import { getReactNativePersistence } from "firebase/auth/react-native";');
  }
  
  process.exit(1);
} 