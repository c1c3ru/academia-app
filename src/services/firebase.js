// Configuração do Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Detectar plataforma
const isWeb = Platform.OS === 'web';

// Configuração do Firebase - compatível com web
const firebaseConfig = {
  apiKey: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_FIREBASE_API_KEY) || "AIzaSyA_hzFPt9hUITlMq9BrsJuxAdzycVR3AEI",
  authDomain: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN) || "academia-app-5cf79.firebaseapp.com",
  projectId: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_FIREBASE_PROJECT_ID) || "academia-app-5cf79",
  storageBucket: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET) || "academia-app-5cf79.firebasestorage.app",
  messagingSenderId: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || "377489252583",
  appId: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_FIREBASE_APP_ID) || "1:377489252583:android:87f2c3948511325769c242"
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
  console.log('✅ Firebase App inicializado para', isWeb ? 'Web' : 'Mobile');
  
  // Inicializar Auth com configurações específicas da plataforma
  auth = getAuth(app);
  
  // Configurações específicas para web
  if (isWeb) {
    // Configurar persistência para web
    auth.settings = {
      appVerificationDisabledForTesting: false,
    };
  }
  
  console.log('✅ Firebase Auth inicializado');
  
  // Inicializar Firestore com configurações para React Native/Web
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    useFetchStreams: false
  });
  console.log('✅ Firebase Firestore inicializado com long-polling');
  
  console.log('🎉 Firebase inicializado com sucesso para', Platform.OS);
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error);
  console.error('Platform:', Platform.OS);
  console.error('Stack:', error.stack);
  throw error;
}

export { auth, db };
export default app;

