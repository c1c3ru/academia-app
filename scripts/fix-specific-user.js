const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFunctions, httpsCallable } = require('firebase/functions');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBnWCWCzYJJXMZJhSrjJGNfgGWYCvKKLCM",
  authDomain: "academia-app-5cf79.firebaseapp.com",
  projectId: "academia-app-5cf79",
  storageBucket: "academia-app-5cf79.appspot.com",
  messagingSenderId: "1092439421699",
  appId: "1:1092439421699:web:a1b2c3d4e5f6g7h8i9j0k1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);

async function fixUserClaimsForSpecificUser() {
  console.log('🔧 Corrigindo Custom Claims para usuário específico...\n');

  try {
    // Fazer login como admin (você precisará fornecer credenciais de um admin)
    console.log('🔐 Fazendo login como admin...');
    
    // IMPORTANTE: Substitua por credenciais de um usuário admin válido
    const adminEmail = 'cicerosilva.ifce@gmail.com'; // Substitua pelo email do admin
    const adminPassword = 'sua_senha_aqui'; // Substitua pela senha do admin
    
    console.log('⚠️  ATENÇÃO: Este script precisa de credenciais de admin.');
    console.log('   Edite o arquivo e adicione email/senha de um usuário admin válido.\n');
    
    // Para demonstração, vou mostrar como usar a função sem fazer login real
    console.log('📋 Para corrigir manualmente, execute os seguintes passos:');
    console.log('1. Abra o console do Firebase: https://console.firebase.google.com/project/academia-app-5cf79');
    console.log('2. Vá em Authentication > Users');
    console.log('3. Encontre o usuário com problema');
    console.log('4. Ou use o script de migração completa\n');
    
    // Exemplo de como chamar a função (descomentado quando tiver credenciais)
    /*
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log('✅ Login realizado com sucesso!');
    
    const fixUserClaims = httpsCallable(functions, 'fixUserClaims');
    
    // ID do usuário com problema (substitua pelo ID real)
    const userId = 'ID_DO_USUARIO_AQUI';
    
    const result = await fixUserClaims({ userId });
    console.log('✅ Claims corrigidos:', result.data);
    */
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Função para migrar todos os usuários usando a Cloud Function
async function migrateAllUsers() {
  console.log('🔧 Migrando todos os usuários...\n');
  
  try {
    // Para usar esta função, você precisa estar logado como admin
    console.log('📋 Para migrar todos os usuários:');
    console.log('1. Faça login no app como admin');
    console.log('2. Abra o console do navegador (F12)');
    console.log('3. Execute o seguinte código JavaScript:\n');
    
    console.log(`
// Cole este código no console do navegador quando estiver logado como admin:
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const migrateUsers = httpsCallable(functions, 'migrateExistingUsers');

migrateUsers()
  .then((result) => {
    console.log('✅ Migração concluída:', result.data);
  })
  .catch((error) => {
    console.error('❌ Erro na migração:', error);
  });
`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

console.log('🚀 Script de correção de Custom Claims\n');
console.log('Escolha uma opção:');
console.log('1. Corrigir usuário específico (requer edição do script)');
console.log('2. Ver instruções para migração completa\n');

// Executar migração completa por padrão
migrateAllUsers();
