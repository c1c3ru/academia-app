const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Cloud Function para definir Custom Claims quando um usuário é criado ou atualizado
 */
exports.setUserClaims = functions.firestore
  .document('users/{userId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    
    try {
      // Se o documento foi deletado, remover claims
      if (!change.after.exists) {
        await admin.auth().setCustomUserClaims(userId, null);
        console.log(`Claims removidos para usuário ${userId}`);
        return;
      }

      const userData = change.after.data();
      
      // Definir claims baseados nos dados do usuário
      const claims = {
        role: userData.userType || userData.tipo || 'student',
        academiaId: userData.academiaId || null
      };

      // Normalizar role para valores padronizados
      if (claims.role === 'administrador' || claims.role === 'admin') {
        claims.role = 'admin';
      } else if (claims.role === 'instrutor' || claims.role === 'instructor') {
        claims.role = 'instructor';
      } else if (claims.role === 'aluno' || claims.role === 'student') {
        claims.role = 'student';
      }

      // Definir claims no token do usuário
      await admin.auth().setCustomUserClaims(userId, claims);
      
      console.log(`Claims definidos para usuário ${userId}:`, claims);
      
      // Atualizar documento do usuário com timestamp da última atualização de claims
      await change.after.ref.update({
        claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    } catch (error) {
      console.error(`Erro ao definir claims para usuário ${userId}:`, error);
    }
  });

/**
 * Cloud Function para criar uma nova academia
 * Apenas usuários autenticados sem academia podem criar uma nova academia
 */
exports.createAcademy = functions.https.onCall(async (data, context) => {
  // Verificar se o usuário está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  // Verificar se o usuário não tem academia associada
  if (context.auth.token.academiaId) {
    throw new functions.https.HttpsError('permission-denied', 'Usuário já está associado a uma academia');
  }

  const { name, description, address, phone, email } = data;

  if (!name) {
    throw new functions.https.HttpsError('invalid-argument', 'Nome da academia é obrigatório');
  }

  try {
    const userId = context.auth.uid;
    
    // Gerar ID único para a nova academia
    const academyRef = admin.firestore().collection('gyms').doc();
    const academyId = academyRef.id;

    // Criar documento da academia
    await academyRef.set({
      name: name,
      description: description || '',
      address: address || '',
      phone: phone || '',
      email: email || '',
      adminId: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Atualizar claims do usuário para torná-lo admin desta academia
    const claims = {
      role: 'admin',
      academiaId: academyId
    };

    await admin.auth().setCustomUserClaims(userId, claims);
    
    // Atualizar documento do usuário
    await admin.firestore().collection('users').doc(userId).update({
      userType: 'admin',
      academiaId: academyId,
      claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Academia criada: ${academyId} por usuário ${userId}`);
    return { success: true, academyId: academyId, claims };

  } catch (error) {
    console.error('Erro ao criar academia:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao criar academia');
  }
});

/**
 * Cloud Function para gerar código de convite
 * Apenas admins podem gerar convites para sua academia
 */
exports.generateInvite = functions.https.onCall(async (data, context) => {
  // Verificar se o usuário está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  // Verificar se o usuário é admin
  if (context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Apenas admins podem gerar convites');
  }

  const academiaId = context.auth.token.academiaId;
  if (!academiaId) {
    throw new functions.https.HttpsError('permission-denied', 'Admin deve estar associado a uma academia');
  }

  const { role, expiresInDays = 7, maxUses = 1 } = data;

  if (!role || !['instructor', 'student'].includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Role deve ser instructor ou student');
  }

  try {
    // Gerar código único
    const inviteCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Calcular data de expiração
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Criar convite no Firestore
    const inviteRef = admin.firestore().collection('invites').doc();
    await inviteRef.set({
      code: inviteCode,
      academiaId: academiaId,
      role: role,
      createdBy: context.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      maxUses: maxUses,
      usedCount: 0,
      isActive: true
    });

    console.log(`Convite gerado: ${inviteCode} para academia ${academiaId}`);
    return { success: true, inviteCode: inviteCode, expiresAt: expiresAt.toISOString() };

  } catch (error) {
    console.error('Erro ao gerar convite:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao gerar convite');
  }
});

/**
 * Cloud Function para usar código de convite
 * Usuários autenticados sem academia podem usar convites
 */
exports.useInvite = functions.https.onCall(async (data, context) => {
  // Verificar se o usuário está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  // Verificar se o usuário não tem academia associada
  if (context.auth.token.academiaId) {
    throw new functions.https.HttpsError('permission-denied', 'Usuário já está associado a uma academia');
  }

  const { inviteCode } = data;

  if (!inviteCode) {
    throw new functions.https.HttpsError('invalid-argument', 'Código de convite é obrigatório');
  }

  try {
    const userId = context.auth.uid;
    
    // Buscar convite
    const inviteQuery = await admin.firestore()
      .collection('invites')
      .where('code', '==', inviteCode)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (inviteQuery.empty) {
      throw new functions.https.HttpsError('not-found', 'Código de convite inválido ou expirado');
    }

    const inviteDoc = inviteQuery.docs[0];
    const inviteData = inviteDoc.data();

    // Verificar se o convite não expirou
    if (inviteData.expiresAt.toDate() < new Date()) {
      throw new functions.https.HttpsError('permission-denied', 'Código de convite expirado');
    }

    // Verificar se ainda há usos disponíveis
    if (inviteData.usedCount >= inviteData.maxUses) {
      throw new functions.https.HttpsError('permission-denied', 'Código de convite esgotado');
    }

    // Atualizar claims do usuário
    const claims = {
      role: inviteData.role,
      academiaId: inviteData.academiaId
    };

    await admin.auth().setCustomUserClaims(userId, claims);
    
    // Atualizar documento do usuário
    await admin.firestore().collection('users').doc(userId).update({
      userType: inviteData.role,
      academiaId: inviteData.academiaId,
      claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Atualizar contador de usos do convite
    await inviteDoc.ref.update({
      usedCount: admin.firestore.FieldValue.increment(1),
      lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUsedBy: userId
    });

    // Se atingiu o limite de usos, desativar convite
    if (inviteData.usedCount + 1 >= inviteData.maxUses) {
      await inviteDoc.ref.update({ isActive: false });
    }

    console.log(`Convite usado: ${inviteCode} por usuário ${userId}`);
    return { success: true, academiaId: inviteData.academiaId, role: inviteData.role };

  } catch (error) {
    console.error('Erro ao usar convite:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Erro ao usar convite');
  }
});

/**
 * Função para migrar usuários existentes (remover superAdmin)
 */
exports.migrateExistingUsers = functions.https.onCall(async (data, context) => {
  // Esta função pode ser executada por qualquer admin para migrar dados da sua academia
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  try {
    const usersSnapshot = await admin.firestore().collection('users').get();
    const batch = admin.firestore().batch();
    let count = 0;
    let errors = 0;

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;

      try {
        // Verificar se o usuário existe no Authentication antes de definir claims
        const userRecord = await admin.auth().getUser(userId);
        
        const claims = {
          role: userData.userType || userData.tipo || 'student',
          academiaId: userData.academiaId || null
        };

        // Normalizar role
        if (claims.role === 'administrador' || claims.role === 'admin') {
          claims.role = 'admin';
        } else if (claims.role === 'instrutor' || claims.role === 'instructor') {
          claims.role = 'instructor';
        } else if (claims.role === 'aluno' || claims.role === 'student') {
          claims.role = 'student';
        }

        await admin.auth().setCustomUserClaims(userId, claims);
        
        // Atualizar documento (remover superAdmin se existir)
        const updateData = {
          claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        if (userData.superAdmin !== undefined) {
          updateData.superAdmin = admin.firestore.FieldValue.delete();
        }
        
        batch.update(doc.ref, updateData);
        count++;
        
        console.log(`Claims definidos para ${userRecord.email}: ${JSON.stringify(claims)}`);
        
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          console.log(`Usuário ${userId} não encontrado no Authentication, pulando...`);
          errors++;
        } else {
          console.error(`Erro ao processar usuário ${userId}:`, authError);
          errors++;
        }
      }
    }

    await batch.commit();
    console.log(`Migração concluída: ${count} usuários processados, ${errors} erros`);
    return { success: true, migratedUsers: count, errors: errors };

  } catch (error) {
    console.error('Erro na migração:', error);
    throw new functions.https.HttpsError('internal', 'Erro na migração');
  }
});

/**
 * Cloud Function para definir claims customizados manualmente
 */
exports.setCustomClaims = functions.https.onCall(async (data, context) => {
  // Verificar se o usuário está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  // Verificar se o usuário é admin (ou permitir para usuários específicos)
  const allowedEmails = ['cti.maracanau@ifce.edu.br', 'deppi.maracanau@ifce.edu.br'];
  if (context.auth.token.role !== 'admin' && !allowedEmails.includes(context.auth.token.email)) {
    throw new functions.https.HttpsError('permission-denied', 'Apenas admins podem definir claims');
  }

  const { uid, claims } = data;

  if (!uid || !claims) {
    throw new functions.https.HttpsError('invalid-argument', 'UID e claims são obrigatórios');
  }

  try {
    // Definir claims no token do usuário
    await admin.auth().setCustomUserClaims(uid, claims);
    
    console.log(`Claims definidos para usuário ${uid}:`, claims);
    
    // Tentar atualizar o documento do usuário também
    try {
      await admin.firestore().collection('users').doc(uid).update({
        userType: claims.role,
        academiaId: claims.academiaId,
        claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (updateError) {
      // Se não conseguir atualizar em 'users', tentar em 'usuarios'
      try {
        await admin.firestore().collection('usuarios').doc(uid).update({
          userType: claims.role,
          academiaId: claims.academiaId,
          claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (updateError2) {
        console.log('Não foi possível atualizar documento do usuário, mas claims foram definidos');
      }
    }

    return { success: true, uid, claims };

  } catch (error) {
    console.error('Erro ao definir claims:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao definir claims');
  }
});

/**
 * Cloud Function para migrar coleções para nova estrutura
 */
exports.migrateCollections = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  if (context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Apenas admins podem executar migração');
  }

  const { dryRun = true } = data;

  try {
    const collectionMappings = {
      'alunos': 'students',
      'instrutores': 'instructors', 
      'turmas': 'classes',
      'pagamentos': 'payments',
      'planos': 'plans',
      'eventRegistrations': 'event_registrations'
    };

    console.log(`🚀 Iniciando migração de coleções (dryRun: ${dryRun})...`);
    
    const gymsSnapshot = await admin.firestore().collection('gyms').get();
    console.log(`📊 Encontradas ${gymsSnapshot.size} academias para migrar`);
    
    let totalMigrated = 0;
    let totalErrors = 0;
    const migrationReport = [];
    
    for (const gymDoc of gymsSnapshot.docs) {
      const gymId = gymDoc.id;
      const gymData = gymDoc.data();
      
      console.log(`🏢 Processando academia: ${gymData.name || gymId}`);
      
      for (const [oldName, newName] of Object.entries(collectionMappings)) {
        try {
          const oldCollectionRef = admin.firestore().collection('gyms').doc(gymId).collection(oldName);
          const oldDocsSnapshot = await oldCollectionRef.get();
          
          if (oldDocsSnapshot.empty) {
            continue;
          }
          
          console.log(`📁 ${oldName} -> ${newName}: ${oldDocsSnapshot.size} documentos`);
          
          if (!dryRun) {
            const newCollectionRef = admin.firestore().collection('gyms').doc(gymId).collection(newName);
            const batch = admin.firestore().batch();
            
            oldDocsSnapshot.docs.forEach(doc => {
              const newDocRef = newCollectionRef.doc(doc.id);
              batch.set(newDocRef, doc.data());
            });
            
            await batch.commit();
            console.log(`✅ Migrados ${oldDocsSnapshot.size} documentos de ${oldName} para ${newName}`);
          }
          
          totalMigrated += oldDocsSnapshot.size;
          migrationReport.push({
            gym: gymData.name || gymId,
            collection: `${oldName} -> ${newName}`,
            documents: oldDocsSnapshot.size,
            status: dryRun ? 'simulated' : 'migrated'
          });
          
        } catch (error) {
          console.error(`❌ Erro ao migrar ${oldName}:`, error.message);
          totalErrors++;
          migrationReport.push({
            gym: gymData.name || gymId,
            collection: `${oldName} -> ${newName}`,
            documents: 0,
            status: 'error',
            error: error.message
          });
        }
      }
    }
    
    console.log(`🎉 Migração ${dryRun ? 'simulada' : 'real'} concluída!`);
    console.log(`📊 Total de documentos: ${totalMigrated}`);
    console.log(`❌ Total de erros: ${totalErrors}`);
    
    return { 
      success: true, 
      dryRun,
      totalDocuments: totalMigrated, 
      errors: totalErrors,
      report: migrationReport
    };

  } catch (error) {
    console.error('❌ Erro geral na migração:', error);
    throw new functions.https.HttpsError('internal', 'Erro na migração de coleções');
  }
});
