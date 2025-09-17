const admin = require('firebase-admin');

// Inicializar Firebase Admin com credenciais do projeto
const serviceAccount = {
  "type": "service_account",
  "project_id": "academia-app-5cf79",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

// Tentar inicializar com service account ou usar default
try {
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'academia-app-5cf79'
    });
    console.log('✅ Inicializado com service account');
  } else {
    // Usar credenciais padrão (funciona se estiver logado no Firebase CLI)
    admin.initializeApp({
      projectId: 'academia-app-5cf79'
    });
    console.log('✅ Inicializado com credenciais padrão');
  }
} catch (error) {
  console.error('❌ Erro na inicialização:', error.message);
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

async function migrateUserClaims() {
  console.log('🔧 Iniciando migração de Custom Claims...\n');

  try {
    // Buscar todos os usuários do Firestore
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Encontrados ${usersSnapshot.size} usuários\n`);

    let processedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const doc of usersSnapshot.docs) {
      const userId = doc.id;
      const userData = doc.data();

      try {
        console.log(`🔍 Processando: ${userData.nome || userData.email || userId}`);
        
        // Verificar se usuário tem academiaId
        if (!userData.academiaId) {
          console.log(`   ⏭️  Sem academiaId - pulando\n`);
          skippedCount++;
          continue;
        }

        // Buscar usuário no Authentication
        let userRecord;
        try {
          userRecord = await auth.getUser(userId);
        } catch (authError) {
          console.log(`   ⚠️  Usuário não encontrado no Authentication - pulando\n`);
          skippedCount++;
          continue;
        }

        const currentClaims = userRecord.customClaims || {};
        
        // Verificar se já tem claims corretos
        if (currentClaims.academiaId === userData.academiaId && currentClaims.role) {
          console.log(`   ✅ Claims já corretos - pulando\n`);
          skippedCount++;
          continue;
        }

        // Definir novos claims
        const newClaims = {
          role: userData.userType || userData.tipo || 'student',
          academiaId: userData.academiaId
        };

        // Normalizar role
        if (newClaims.role === 'administrador' || newClaims.role === 'admin') {
          newClaims.role = 'admin';
        } else if (newClaims.role === 'instrutor' || newClaims.role === 'instructor') {
          newClaims.role = 'instructor';
        } else if (newClaims.role === 'aluno' || newClaims.role === 'student') {
          newClaims.role = 'student';
        }

        console.log(`   🔄 Definindo claims: role=${newClaims.role}, academiaId=${newClaims.academiaId}`);

        // Definir Custom Claims
        await auth.setCustomUserClaims(userId, newClaims);
        
        // Atualizar timestamp no documento
        await doc.ref.update({
          claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`   ✅ Claims atualizados com sucesso!\n`);
        processedCount++;

      } catch (error) {
        console.error(`   ❌ Erro ao processar usuário: ${error.message}\n`);
        errorCount++;
      }
    }

    console.log('📈 RESUMO DA MIGRAÇÃO:');
    console.log(`✅ Usuários processados: ${processedCount}`);
    console.log(`⏭️  Usuários pulados: ${skippedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📊 Total: ${usersSnapshot.size}`);

    if (processedCount > 0) {
      console.log('\n🎉 Migração concluída com sucesso!');
      console.log('💡 Os usuários precisam fazer logout/login para aplicar as mudanças.');
    }

  } catch (error) {
    console.error('💥 Erro geral na migração:', error);
    throw error;
  }
}

// Executar migração
if (require.main === module) {
  migrateUserClaims()
    .then(() => {
      console.log('\n🏁 Script finalizado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { migrateUserClaims };
