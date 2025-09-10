// Script para corrigir usuários no Firestore - executar no console do navegador
// Copie e cole este código no console do navegador quando o app estiver rodando

async function fixUsersInFirestore() {
  console.log('🔧 Iniciando correção de usuários...');
  
  // Importar Firebase do contexto global (assumindo que está disponível)
  const { db } = window.firebaseServices || {};
  
  if (!db) {
    console.error('❌ Firebase não está disponível. Certifique-se de que o app está rodando.');
    return;
  }
  
  // Importar funções do Firestore
  const { collection, query, where, getDocs, doc, updateDoc, setDoc, serverTimestamp } = window.firebaseFirestore || {};
  
  if (!collection) {
    console.error('❌ Funções do Firestore não estão disponíveis.');
    return;
  }
  
  const USERS_TO_FIX = [
    'cti.maracanau@ifce.edu.br',
    'deppi.maracanau@ifce.edu.br', 
    'cicero.silva@ifce.edu.br'
  ];
  
  const IFCE_ACADEMIA_ID = 'ifce-maracanau';
  
  try {
    // Verificar se a academia IFCE existe
    console.log('🏢 Verificando academia IFCE...');
    const academiasRef = collection(db, 'academias');
    const academiasSnapshot = await getDocs(academiasRef);
    
    let ifceExists = false;
    academiasSnapshot.forEach(docSnap => {
      if (docSnap.id === IFCE_ACADEMIA_ID) {
        ifceExists = true;
        console.log('✅ Academia IFCE já existe');
      }
    });
    
    // Criar academia se não existir
    if (!ifceExists) {
      console.log('🏗️ Criando academia IFCE...');
      const academiaRef = doc(db, 'academias', IFCE_ACADEMIA_ID);
      await setDoc(academiaRef, {
        name: 'IFCE - Campus Maracanaú',
        nome: 'IFCE - Campus Maracanaú',
        address: 'Av. Parque Central, 1315 - Distrito Industrial I, Maracanaú - CE',
        phone: '(85) 3878-6300',
        email: 'maracanau@ifce.edu.br',
        createdAt: serverTimestamp(),
        active: true,
        tipo: 'publica',
        cnpj: '10.744.098/0008-51'
      });
      console.log('✅ Academia IFCE criada');
    }
    
    // Corrigir cada usuário
    for (const email of USERS_TO_FIX) {
      console.log(`\n👤 Processando usuário: ${email}`);
      
      // Buscar usuário
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('email', '==', email));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        console.log(`❌ Usuário ${email} não encontrado`);
        continue;
      }
      
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      
      console.log(`📊 Dados atuais:`, {
        email: userData.email,
        academiaId: userData.academiaId,
        profileCompleted: userData.profileCompleted,
        tipo: userData.tipo,
        userType: userData.userType
      });
      
      // Preparar atualizações
      const updates = {};
      let needsUpdate = false;
      
      if (!userData.academiaId) {
        updates.academiaId = IFCE_ACADEMIA_ID;
        needsUpdate = true;
        console.log(`  ✅ Adicionando academiaId: ${IFCE_ACADEMIA_ID}`);
      }
      
      if (!userData.profileCompleted) {
        updates.profileCompleted = true;
        needsUpdate = true;
        console.log(`  ✅ Definindo profileCompleted: true`);
      }
      
      // Garantir userType correto
      if (userData.tipo && !userData.userType) {
        const typeMapping = {
          'aluno': 'student',
          'instrutor': 'instructor',
          'administrador': 'admin'
        };
        updates.userType = typeMapping[userData.tipo] || userData.tipo;
        needsUpdate = true;
        console.log(`  ✅ Definindo userType: ${updates.userType}`);
      }
      
      if (needsUpdate) {
        updates.updatedAt = serverTimestamp();
        await updateDoc(userDoc.ref, updates);
        console.log(`✅ Usuário ${email} atualizado com sucesso!`);
      } else {
        console.log(`✅ Usuário ${email} já está correto`);
      }
    }
    
    console.log('\n🎉 Correção concluída! Recarregue a página para ver as mudanças.');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
}

// Executar a função
fixUsersInFirestore();
