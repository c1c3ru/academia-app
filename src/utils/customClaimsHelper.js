import { auth } from '../services/firebase';

/**
 * Utilitário para gerenciar Custom Claims do Firebase Authentication
 * Integra com a nova arquitetura sem superAdmin
 */

/**
 * Força a atualização do ID Token para obter os Custom Claims mais recentes
 * Deve ser chamado após operações que modificam claims (createAcademy, useInvite, etc.)
 */
export const refreshUserToken = async () => {
  try {
    console.log('🔄 refreshUserToken: Forçando atualização do ID Token...');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('⚠️ refreshUserToken: Nenhum usuário logado');
      return null;
    }
    
    // Força a atualização do token (true = forçar refresh)
    const idToken = await currentUser.getIdToken(true);
    console.log('✅ refreshUserToken: Token atualizado com sucesso');
    
    return idToken;
  } catch (error) {
    console.error('❌ refreshUserToken: Erro ao atualizar token:', error);
    throw error;
  }
};

/**
 * Obtém os Custom Claims do usuário atual
 */
export const getUserClaims = async () => {
  try {
    console.log('🔍 getUserClaims: Obtendo claims do usuário...');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('⚠️ getUserClaims: Nenhum usuário logado');
      return null;
    }
    
    // Obter o token atual (pode estar em cache)
    const idTokenResult = await currentUser.getIdTokenResult();
    const claims = idTokenResult.claims;
    
    console.log('📋 getUserClaims: Claims obtidos:', {
      role: claims.role,
      academiaId: claims.academiaId,
      hasAcademiaId: !!claims.academiaId,
      hasRole: !!claims.role
    });
    
    return {
      role: claims.role || null,
      academiaId: claims.academiaId || null,
      customClaims: claims
    };
  } catch (error) {
    console.error('❌ getUserClaims: Erro ao obter claims:', error);
    throw error;
  }
};

/**
 * Verifica se o usuário tem Custom Claims configurados
 */
export const hasValidClaims = async () => {
  try {
    const claims = await getUserClaims();
    
    if (!claims) {
      return false;
    }
    
    const isValid = !!(claims.role && claims.academiaId);
    
    console.log('🔍 hasValidClaims: Resultado:', {
      isValid,
      role: claims.role,
      academiaId: claims.academiaId
    });
    
    return isValid;
  } catch (error) {
    console.error('❌ hasValidClaims: Erro na verificação:', error);
    return false;
  }
};

/**
 * Aguarda até que os Custom Claims sejam atualizados
 * Útil após chamar Cloud Functions que modificam claims
 */
export const waitForClaimsUpdate = async (expectedAcademiaId, maxAttempts = 10, delayMs = 1000) => {
  console.log('⏳ waitForClaimsUpdate: Aguardando atualização dos claims...', {
    expectedAcademiaId,
    maxAttempts,
    delayMs
  });
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`🔄 waitForClaimsUpdate: Tentativa ${attempt}/${maxAttempts}`);
      
      // Forçar refresh do token
      await refreshUserToken();
      
      // Verificar se os claims foram atualizados
      const claims = await getUserClaims();
      
      if (claims && claims.academiaId === expectedAcademiaId) {
        console.log('✅ waitForClaimsUpdate: Claims atualizados com sucesso!');
        return claims;
      }
      
      if (attempt < maxAttempts) {
        console.log(`⏳ waitForClaimsUpdate: Claims ainda não atualizados, aguardando ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`❌ waitForClaimsUpdate: Erro na tentativa ${attempt}:`, error);
      
      if (attempt === maxAttempts) {
        throw error;
      }
    }
  }
  
  console.log('⚠️ waitForClaimsUpdate: Timeout - claims não foram atualizados no tempo esperado');
  return null;
};

/**
 * Verifica se o usuário precisa de onboarding (sem claims válidos)
 */
export const needsOnboarding = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return true; // Não logado = precisa de onboarding
    }
    
    const hasValidClaimsResult = await hasValidClaims();
    const needsOnboardingResult = !hasValidClaimsResult;
    
    console.log('🔍 needsOnboarding: Resultado:', {
      needsOnboarding: needsOnboardingResult,
      hasValidClaims: hasValidClaimsResult,
      userEmail: currentUser.email
    });
    
    return needsOnboardingResult;
  } catch (error) {
    console.error('❌ needsOnboarding: Erro na verificação:', error);
    return true; // Em caso de erro, assumir que precisa de onboarding
  }
};

/**
 * Utilitário para debug - mostra todos os claims do usuário
 */
export const debugUserClaims = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('🐛 debugUserClaims: Nenhum usuário logado');
      return;
    }
    
    const idTokenResult = await currentUser.getIdTokenResult();
    
    console.log('🐛 debugUserClaims: Informações completas do usuário:', {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      emailVerified: currentUser.emailVerified,
      isAnonymous: currentUser.isAnonymous,
      claims: idTokenResult.claims,
      authTime: idTokenResult.authTime,
      issuedAtTime: idTokenResult.issuedAtTime,
      expirationTime: idTokenResult.expirationTime
    });
  } catch (error) {
    console.error('❌ debugUserClaims: Erro no debug:', error);
  }
};
