// Configuração do Firebase
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
// import { getStorage } from 'firebase/storage'; // Removido - não necessário
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCq9vc3dLfWdGWF4kFXiaj1cy92R1CNKAc",
  authDomain: "academia-app-5cf79.firebaseapp.com",
  projectId: "academia-app-5cf79",
  storageBucket: "academia-app-5cf79.firebasestorage.app",
  messagingSenderId: "377489252583",
  appId: "1:377489252583:web:ac369431965301dd69c242"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth com persistência adequada para cada plataforma
let auth;
if (Platform.OS === 'web') {
  // Para web, usar getAuth com browserLocalPersistence
  auth = getAuth(app);
} else {
  // Para mobile, usar initializeAuth com AsyncStorage
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth };
export const db = getFirestore(app);
// export const storage = getStorage(app); // Removido - não necessário

export default app;

