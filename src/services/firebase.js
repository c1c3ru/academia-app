// Configuração do Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase - usando valores do google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyA_hzFPt9hUITlMq9BrsJuxAdzycVR3AEI",
  authDomain: "academia-app-5cf79.firebaseapp.com",
  projectId: "academia-app-5cf79",
  storageBucket: "academia-app-5cf79.firebasestorage.app",
  messagingSenderId: "377489252583",
  appId: "1:377489252583:android:87f2c3948511325769c242"
};

console.log('🔥 Inicializando Firebase...');
console.log('📋 Config:', {
  apiKey: firebaseConfig.apiKey ? 'Presente' : 'Ausente',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId
});

// Função para inicializar Firebase com tratamento de erro
let app;
let auth;
let db;

try {
  // Inicializar Firebase
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase App inicializado');
  
  // Inicializar Auth
  auth = getAuth(app);
  console.log('✅ Firebase Auth inicializado');
  
  // Inicializar Firestore
  db = getFirestore(app);
  console.log('✅ Firebase Firestore inicializado');
  
  console.log('🎉 Firebase inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error);
  console.error('Stack:', error.stack);
  throw error;
}

export { auth, db };
export default app;

