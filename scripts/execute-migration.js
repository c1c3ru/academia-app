// Script para executar a migração via Firebase Admin SDK
// Este script será executado no contexto das Cloud Functions

const admin = require('firebase-admin');

// Função para executar a migração diretamente
async function executeMigration() {
  console.log('🔧 Executando migração de Custom Claims...');
  
  try {
    // Buscar todos os usuários
    const usersSnapshot = await admin.firestore().collection('users').get();
    console.log(`📊 Encontrados ${usersSnapshot.size} usuários`);

    let processedCount = 0;
    let errorCount = 0;

    for (const doc of usersSnapshot.docs) {
      const userId = doc.id;
      const userData = doc.data();

      try {
        // Verificar se usuário tem academiaId
        if (userData.academiaId) {
          console.log(`🔄 Processando usuário: ${userData.nome || userData.email || userId}`);
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
          await admin.auth().setCustomUserClaims(userId, claims);
          
          // Atualizar timestamp no documento
          await doc.ref.update({
            claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          console.log(`   ✅ Claims definidos: role=${claims.role}, academiaId=${claims.academiaId}`);
          processedCount++;
        } else {
          console.log(`⏭️  Usuário ${userData.nome || userId} não tem academiaId - pulando`);
        }
      } catch (error) {
        console.error(`❌ Erro ao processar usuário ${userId}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📈 RESUMO DA MIGRAÇÃO:');
    console.log(`✅ Usuários processados: ${processedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📊 Total de usuários: ${usersSnapshot.size}`);

    return { success: true, processedCount, errorCount, totalUsers: usersSnapshot.size };

  } catch (error) {
    console.error('❌ Erro geral na migração:', error);
    throw error;
  }
}

module.exports = { executeMigration };
