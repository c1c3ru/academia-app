const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'academia-app-5cf79'
  });
}

const db = admin.firestore();

async function fixUserClaims() {
  try {
    console.log('🔧 Iniciando correção dos claims do usuário...');
    
    const userEmail = 'cicero.silva@ifce.edu.br';
    const correctAcademiaId = 'yCRtgOHYvw7kiHmF12aw';
    
    // 1. Buscar o usuário pelo email
    console.log(`🔍 Buscando usuário: ${userEmail}`);
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    console.log(`✅ Usuário encontrado: ${userRecord.uid}`);
    
    // 2. Verificar claims atuais
    console.log('📋 Claims atuais:', userRecord.customClaims);
    
    // 3. Verificar se a academia correta existe
    console.log(`🏢 Verificando se academia ${correctAcademiaId} existe...`);
    
    let academiaExists = false;
    let academiaData = null;
    
    // Verificar em gyms
    try {
      const gymDoc = await db.collection('gyms').doc(correctAcademiaId).get();
      if (gymDoc.exists) {
        academiaExists = true;
        academiaData = gymDoc.data();
        console.log(`✅ Academia encontrada em /gyms/${correctAcademiaId}:`, academiaData.name || 'Sem nome');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar gyms:', error.message);
    }
    
    // Se não encontrou em gyms, verificar em academias
    if (!academiaExists) {
      try {
        const academiaDoc = await db.collection('academias').doc(correctAcademiaId).get();
        if (academiaDoc.exists) {
          academiaExists = true;
          academiaData = academiaDoc.data();
          console.log(`✅ Academia encontrada em /academias/${correctAcademiaId}:`, academiaData.name || 'Sem nome');
        }
      } catch (error) {
        console.log('❌ Erro ao verificar academias:', error.message);
      }
    }
    
    if (!academiaExists) {
      console.log('❌ Academia não encontrada! Criando academia de exemplo...');
      
      // Criar academia de exemplo
      const academiaData = {
        name: 'Academia Exemplo',
        address: 'Endereço de Exemplo',
        phone: '(85) 99999-9999',
        email: 'contato@academiaexemplo.com',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        active: true
      };
      
      await db.collection('gyms').doc(correctAcademiaId).set(academiaData);
      console.log('✅ Academia criada com sucesso!');
    }
    
    // 4. Atualizar claims do usuário
    console.log('🔧 Atualizando claims do usuário...');
    const newClaims = {
      role: 'instructor',
      academiaId: correctAcademiaId,
      hasAcademiaId: true,
      hasRole: true
    };
    
    await admin.auth().setCustomUserClaims(userRecord.uid, newClaims);
    console.log('✅ Claims atualizados:', newClaims);
    
    // 5. Atualizar perfil do usuário no Firestore
    console.log('👤 Atualizando perfil do usuário no Firestore...');
    
    const userProfileRef = db.collection('users').doc(userRecord.uid);
    const userProfileDoc = await userProfileRef.get();
    
    if (userProfileDoc.exists) {
      await userProfileRef.update({
        academiaId: correctAcademiaId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Perfil do usuário atualizado');
    } else {
      console.log('❌ Perfil do usuário não encontrado no Firestore');
    }
    
    console.log('🎉 Correção concluída com sucesso!');
    console.log('📝 Resumo das alterações:');
    console.log(`   - Claims atualizados para academia: ${correctAcademiaId}`);
    console.log(`   - Perfil do usuário atualizado`);
    console.log(`   - Usuário: ${userEmail} (${userRecord.uid})`);
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
}

// Executar correção
fixUserClaims().then(() => {
  console.log('🏁 Script finalizado');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});
