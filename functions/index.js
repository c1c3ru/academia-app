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
        academiaId: userData.academiaId || null,
        superAdmin: userData.superAdmin === true || false
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
 * Função HTTP para forçar atualização de claims (para admins)
 */
exports.updateUserClaims = functions.https.onCall(async (data, context) => {
  // Verificar se o usuário está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  // Verificar se o usuário é super admin
  if (!context.auth.token.superAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Apenas super admins podem atualizar claims');
  }

  const { userId, role, academiaId, superAdmin } = data;

  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'userId é obrigatório');
  }

  try {
    const claims = {
      role: role || 'student',
      academiaId: academiaId || null,
      superAdmin: superAdmin === true || false
    };

    await admin.auth().setCustomUserClaims(userId, claims);
    
    // Atualizar documento do usuário
    await admin.firestore().collection('users').doc(userId).update({
      userType: role,
      academiaId: academiaId,
      superAdmin: superAdmin,
      claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, claims };
  } catch (error) {
    console.error('Erro ao atualizar claims:', error);
    throw new functions.https.HttpsError('internal', 'Erro interno do servidor');
  }
});

/**
 * Função para criar o primeiro super admin
 */
exports.createSuperAdmin = functions.https.onCall(async (data, context) => {
  const { email, password, name } = data;

  if (!email || !password || !name) {
    throw new functions.https.HttpsError('invalid-argument', 'Email, senha e nome são obrigatórios');
  }

  try {
    // Criar usuário no Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
      emailVerified: true
    });

    // Definir claims de super admin
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'admin',
      academiaId: null,
      superAdmin: true
    });

    // Criar documento do usuário no Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      name: name,
      email: email,
      userType: 'admin',
      superAdmin: true,
      academiaId: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Super admin criado: ${userRecord.uid}`);
    return { success: true, userId: userRecord.uid };

  } catch (error) {
    console.error('Erro ao criar super admin:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao criar super admin');
  }
});

/**
 * Função para migrar usuários existentes (executar uma vez)
 */
exports.migrateExistingUsers = functions.https.onCall(async (data, context) => {
  // Verificar se o usuário é super admin
  if (!context.auth || !context.auth.token.superAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Apenas super admins podem executar migração');
  }

  try {
    const usersSnapshot = await admin.firestore().collection('users').get();
    const batch = admin.firestore().batch();
    let count = 0;

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;

      const claims = {
        role: userData.userType || userData.tipo || 'student',
        academiaId: userData.academiaId || null,
        superAdmin: userData.superAdmin === true || false
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
      
      // Atualizar documento
      batch.update(doc.ref, {
        claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      count++;
    }

    await batch.commit();
    console.log(`Migração concluída: ${count} usuários processados`);
    return { success: true, migratedUsers: count };

  } catch (error) {
    console.error('Erro na migração:', error);
    throw new functions.https.HttpsError('internal', 'Erro na migração');
  }
});
