const admin = require('firebase-admin');

// Inicializar Firebase Admin usando Application Default Credentials
admin.initializeApp({
  projectId: 'academia-app-5cf79'
});

const db = admin.firestore();
const auth = admin.auth();

async function setupClaims() {
  try {
    console.log('🚀 Iniciando configuração de Custom Claims...');
    
    // 1. Buscar todos os usuários do Firestore
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Encontrados ${usersSnapshot.size} usuários`);
    
    let processedCount = 0;
    let errorCount = 0;
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;
      
      try {
        // Determinar role baseado nos dados existentes
        let role = 'student'; // padrão
        if (userData.userType === 'admin' || userData.tipo === 'admin' || 
            userData.userType === 'administrador' || userData.tipo === 'administrador') {
          role = 'admin';
        } else if (userData.userType === 'instructor' || userData.tipo === 'instructor' ||
                   userData.userType === 'instrutor' || userData.tipo === 'instrutor') {
          role = 'instructor';
        }
        
        // Definir claims
        const claims = {
          role: role,
          academiaId: userData.academiaId || null,
          superAdmin: userData.superAdmin === true || false
        };
        
        // Aplicar claims no Authentication
        await auth.setCustomUserClaims(userId, claims);
        
        // Atualizar documento com timestamp
        await doc.ref.update({
          claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✅ Claims definidos para ${userData.name || userData.email || userId}: ${JSON.stringify(claims)}`);
        processedCount++;
        
      } catch (error) {
        console.error(`❌ Erro ao processar usuário ${userId}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Configuração concluída!`);
    console.log(`✅ Processados: ${processedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    
    // 2. Criar um Super Admin se não existir
    const superAdmins = usersSnapshot.docs.filter(doc => doc.data().superAdmin === true);
    
    if (superAdmins.length === 0) {
      console.log('\n🔧 Nenhum Super Admin encontrado. Criando um...');
      
      // Promover o primeiro admin encontrado para Super Admin
      const firstAdmin = usersSnapshot.docs.find(doc => {
        const data = doc.data();
        return data.userType === 'admin' || data.tipo === 'admin' || 
               data.userType === 'administrador' || data.tipo === 'administrador';
      });
      
      if (firstAdmin) {
        const claims = {
          role: 'admin',
          academiaId: firstAdmin.data().academiaId || null,
          superAdmin: true
        };
        
        await auth.setCustomUserClaims(firstAdmin.id, claims);
        await firstAdmin.ref.update({
          superAdmin: true,
          claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`🌟 Super Admin criado: ${firstAdmin.data().name || firstAdmin.data().email}`);
      } else {
        console.log('⚠️ Nenhum admin encontrado para promover a Super Admin');
      }
    } else {
      console.log(`✅ ${superAdmins.length} Super Admin(s) já existem`);
    }
    
    console.log('\n🔄 Aguarde alguns minutos para que os tokens sejam atualizados...');
    console.log('💡 Os usuários podem precisar fazer logout/login para aplicar os novos claims');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    process.exit(0);
  }
}

// Executar
setupClaims();
