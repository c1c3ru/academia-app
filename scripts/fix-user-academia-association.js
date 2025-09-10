const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require('../google-services.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

// Usuários que precisam ser corrigidos
const USERS_TO_FIX = [
  'cti.maracanau@ifce.edu.br',
  'deppi.maracanau@ifce.edu.br', 
  'cicero.silva@ifce.edu.br'
];

// ID da academia IFCE (assumindo que existe)
const IFCE_ACADEMIA_ID = 'ifce-maracanau';

async function checkAndFixUsers() {
  console.log('🔍 Verificando usuários no Firestore...');
  
  try {
    // Primeiro, vamos verificar se a academia IFCE existe
    console.log('\n📋 Verificando academias existentes...');
    const academiasSnapshot = await db.collection('academias').get();
    
    let ifceAcademiaId = null;
    academiasSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Academia: ${doc.id} - Nome: ${data.name || data.nome}`);
      
      // Procurar pela academia do IFCE
      if (data.name?.toLowerCase().includes('ifce') || 
          data.nome?.toLowerCase().includes('ifce') ||
          doc.id.includes('ifce')) {
        ifceAcademiaId = doc.id;
        console.log(`✅ Academia IFCE encontrada: ${ifceAcademiaId}`);
      }
    });
    
    if (!ifceAcademiaId) {
      console.log('❌ Academia IFCE não encontrada. Criando...');
      
      // Criar academia IFCE
      const academiaRef = db.collection('academias').doc(IFCE_ACADEMIA_ID);
      await academiaRef.set({
        name: 'IFCE - Campus Maracanaú',
        nome: 'IFCE - Campus Maracanaú',
        address: 'Av. Parque Central, 1315 - Distrito Industrial I, Maracanaú - CE',
        phone: '(85) 3878-6300',
        email: 'maracanau@ifce.edu.br',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        active: true,
        tipo: 'publica',
        cnpj: '10.744.098/0008-51'
      });
      
      ifceAcademiaId = IFCE_ACADEMIA_ID;
      console.log(`✅ Academia IFCE criada: ${ifceAcademiaId}`);
    }
    
    console.log('\n👥 Verificando usuários...');
    
    // Verificar cada usuário
    for (const email of USERS_TO_FIX) {
      console.log(`\n🔍 Verificando usuário: ${email}`);
      
      // Buscar usuário na coleção users
      const usersSnapshot = await db.collection('users')
        .where('email', '==', email)
        .get();
      
      if (usersSnapshot.empty) {
        console.log(`❌ Usuário ${email} não encontrado na coleção users`);
        continue;
      }
      
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      
      console.log(`📊 Dados atuais do usuário ${email}:`, {
        id: userDoc.id,
        email: userData.email,
        name: userData.name,
        tipo: userData.tipo,
        userType: userData.userType,
        academiaId: userData.academiaId,
        profileCompleted: userData.profileCompleted
      });
      
      // Verificar se precisa atualizar
      const needsUpdate = !userData.academiaId || !userData.profileCompleted;
      
      if (needsUpdate) {
        console.log(`🔧 Atualizando usuário ${email}...`);
        
        const updates = {};
        
        if (!userData.academiaId) {
          updates.academiaId = ifceAcademiaId;
          console.log(`  ✅ Definindo academiaId: ${ifceAcademiaId}`);
        }
        
        if (!userData.profileCompleted) {
          updates.profileCompleted = true;
          console.log(`  ✅ Definindo profileCompleted: true`);
        }
        
        // Garantir que o userType está correto
        if (userData.tipo && !userData.userType) {
          const typeMapping = {
            'aluno': 'student',
            'instrutor': 'instructor', 
            'administrador': 'admin'
          };
          updates.userType = typeMapping[userData.tipo] || userData.tipo;
          console.log(`  ✅ Definindo userType: ${updates.userType}`);
        }
        
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        
        await userDoc.ref.update(updates);
        console.log(`✅ Usuário ${email} atualizado com sucesso!`);
        
      } else {
        console.log(`✅ Usuário ${email} já está correto`);
      }
    }
    
    console.log('\n🎉 Verificação e correção concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

// Função para listar todos os usuários (debug)
async function listAllUsers() {
  console.log('\n📋 Listando todos os usuários...');
  
  try {
    const usersSnapshot = await db.collection('users').get();
    
    console.log(`Total de usuários: ${usersSnapshot.size}`);
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\nUsuário: ${doc.id}`);
      console.log(`  Email: ${data.email}`);
      console.log(`  Nome: ${data.name}`);
      console.log(`  Tipo: ${data.tipo} / ${data.userType}`);
      console.log(`  AcademiaId: ${data.academiaId}`);
      console.log(`  Perfil Completo: ${data.profileCompleted}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
  }
}

// Executar baseado no argumento
const command = process.argv[2];

if (command === 'list') {
  listAllUsers().then(() => process.exit(0));
} else {
  checkAndFixUsers().then(() => process.exit(0));
}
