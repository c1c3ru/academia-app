const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'academia-app-5cf79'
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function fixUserClaims() {
  console.log('🔧 Iniciando correção de Custom Claims...\n');

  try {
    // Buscar todos os usuários
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Encontrados ${usersSnapshot.size} usuários para processar\n`);

    let processedCount = 0;
    let errorCount = 0;

    for (const doc of usersSnapshot.docs) {
      const userId = doc.id;
      const userData = doc.data();

      try {
        // Verificar se usuário tem academiaId mas não tem claims
        if (userData.academiaId) {
          // Buscar claims atuais
          const userRecord = await auth.getUser(userId);
          const currentClaims = userRecord.customClaims || {};

          if (!currentClaims.academiaId || !currentClaims.role) {
            console.log(`🔄 Corrigindo claims para usuário: ${userData.nome || userData.email || userId}`);
            console.log(`   - AcademiaId: ${userData.academiaId}`);
            console.log(`   - UserType: ${userData.userType || userData.tipo || 'student'}`);

            // Definir claims baseado nos dados do perfil
            const claims = {
              role: userData.userType || userData.tipo || 'student',
              academiaId: userData.academiaId
            };

            // Normalizar role
            if (claims.role === 'administrador' || claims.role === 'admin') {
              claims.role = 'admin';
            } else if (claims.role === 'instrutor' || claims.role === 'instructor') {
              claims.role = 'instructor';
            } else if (claims.role === 'aluno' || claims.role === 'student') {
              claims.role = 'student';
            }

            // Definir Custom Claims
            await auth.setCustomUserClaims(userId, claims);
            
            // Atualizar timestamp no documento
            await doc.ref.update({
              claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`   ✅ Claims definidos: role=${claims.role}, academiaId=${claims.academiaId}\n`);
            processedCount++;
          } else {
            console.log(`⏭️  Usuário ${userData.nome || userId} já tem claims corretos`);
          }
        } else {
          console.log(`⚠️  Usuário ${userData.nome || userId} não tem academiaId - pulando`);
        }
      } catch (error) {
        console.error(`❌ Erro ao processar usuário ${userId}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📈 RESUMO DA CORREÇÃO:');
    console.log(`✅ Usuários processados: ${processedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📊 Total de usuários: ${usersSnapshot.size}`);

    if (processedCount > 0) {
      console.log('\n🎉 Correção concluída! Os usuários agora devem conseguir acessar os dados da academia.');
      console.log('💡 Lembre-se: os usuários precisam fazer logout/login ou aguardar a atualização automática do token.');
    }

  } catch (error) {
    console.error('❌ Erro geral na correção:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixUserClaims()
    .then(() => {
      console.log('\n🏁 Script finalizado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { fixUserClaims };
