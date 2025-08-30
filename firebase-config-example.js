// EXEMPLO DE CONFIGURAÇÃO DO FIREBASE
// Copie este arquivo para src/services/firebase.js e substitua pelas suas credenciais reais

// Configuração do Firebase
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SUBSTITUA ESTAS CREDENCIAIS PELAS SUAS CREDENCIAIS REAIS DO FIREBASE
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",                    // Ex: "AIzaSyC1234567890abcdefghijklmnop"
  authDomain: "SEU_PROJETO.firebaseapp.com",    // Ex: "minha-academia.firebaseapp.com"
  projectId: "SEU_PROJECT_ID",                  // Ex: "minha-academia-12345"
  storageBucket: "SEU_PROJETO.appspot.com",     // Ex: "minha-academia.appspot.com"
  messagingSenderId: "SEU_SENDER_ID",           // Ex: "123456789012"
  appId: "SEU_APP_ID"                           // Ex: "1:123456789012:web:abcdef123456"
};

// COMO OBTER SUAS CREDENCIAIS:
// 1. Acesse https://console.firebase.google.com
// 2. Crie um novo projeto ou selecione um existente
// 3. Vá em "Configurações do projeto" (ícone de engrenagem)
// 4. Na aba "Geral", role até "Seus apps"
// 5. Clique em "Adicionar app" e selecione "Web" (ícone </>)
// 6. Registre o app com um nome (ex: "Academia App")
// 7. Copie as credenciais mostradas na tela

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth com persistência AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
