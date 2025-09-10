#!/usr/bin/env node

// Script para criar o usuário de teste necessário para login
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { doc, setDoc, getDoc } = require('firebase/firestore');
const { auth, db } = require('../src/services/firebase');

async function createTestUser() {
  try {
    console.log('🚀 Iniciando criação de usuário de teste...\n');
    
    const testEmail = 'cti.maracau@ifce.edu.br';
    const testPassword = '123456';
    const userName = 'CTI Maracanaú';
    
    console.log(`📧 Email: ${testEmail}`);
    console.log(`🔑 Senha: ${testPassword}`);
    console.log(`👤 Nome: ${userName}\n`);
    
    // Primeiro, verificar se o usuário já existe tentando fazer login
    console.log('🔍 Verificando se o usuário já existe...');
    
    try {
      const existingUser = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('✅ Usuário já existe e pode fazer login!');
      console.log(`👤 UID: ${existingUser.user.uid}`);
      console.log(`📧 Email verificado: ${existingUser.user.emailVerified}`);
      
      // Verificar perfil no Firestore
      const userDoc = await getDoc(doc(db, 'users', existingUser.user.uid));
      if (userDoc.exists()) {
        console.log('✅ Perfil encontrado na coleção "users"');
        console.log('📋 Dados do perfil:', userDoc.data());
      } else {
        console.log('⚠️ Usuário existe no Auth mas não tem perfil no Firestore');
        console.log('💡 Criando perfil...');
        
        await setDoc(doc(db, 'users', existingUser.user.uid), {
          name: userName,
          email: testEmail,
          tipo: 'admin', // Tipo de usuário
          userType: 'admin', // Para compatibilidade
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log('✅ Perfil criado com sucesso!');
      }
      
      return;
    } catch (loginError) {
      if (loginError.code === 'auth/invalid-credential' || 
          loginError.code === 'auth/user-not-found') {
        console.log('❌ Usuário não existe, criando...\n');
      } else {
        console.error('❌ Erro inesperado ao verificar usuário:', loginError);
        return;
      }
    }
    
    // Criar o usuário
    console.log('🆕 Criando nova conta...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const newUser = userCredential.user;
    
    console.log('✅ Conta criada no Firebase Auth!');
    console.log(`👤 UID: ${newUser.uid}`);
    console.log(`📧 Email: ${newUser.email}`);
    
    // Criar perfil no Firestore (nova estrutura)
    console.log('📝 Criando perfil no Firestore...');
    await setDoc(doc(db, 'users', newUser.uid), {
      name: userName,
      email: testEmail,
      tipo: 'admin', // Tipo de usuário - pode ser 'admin', 'instructor', 'student'
      userType: 'admin', // Para compatibilidade com código legacy
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Campos específicos para admin
      permissions: ['all'],
      academiaId: null // Será definido quando associar a uma academia
    });
    
    console.log('✅ Perfil criado no Firestore!');
    
    // Verificar se tudo foi criado corretamente
    console.log('\n🔍 Verificando criação...');
    const userDoc = await getDoc(doc(db, 'users', newUser.uid));
    if (userDoc.exists()) {
      console.log('✅ Verificação bem-sucedida!');
      console.log('📋 Dados do perfil:', userDoc.data());
    }
    
    console.log('\n🎉 Usuário de teste criado com sucesso!');
    console.log('💡 Agora você pode fazer login com:');
    console.log(`   📧 Email: ${testEmail}`);
    console.log(`   🔑 Senha: ${testPassword}`);
    console.log(`   👤 Tipo: Admin`);
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    console.error('📝 Código:', error.code);
    console.error('📝 Mensagem:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('💡 Este email já está em uso. Tente fazer login normalmente.');
    } else if (error.code === 'auth/weak-password') {
      console.log('💡 A senha é muito fraca. Use uma senha mais forte.');
    } else if (error.code === 'auth/invalid-email') {
      console.log('💡 O formato do email é inválido.');
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createTestUser()
    .then(() => {
      console.log('\n✨ Script concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { createTestUser };