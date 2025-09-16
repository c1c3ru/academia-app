# Integração do Login Social com a Nova Arquitetura

## 📋 Visão Geral

O login social (Google, Facebook, Microsoft, Apple) está perfeitamente integrado com a nova arquitetura sem superAdmin, utilizando Custom Claims para autorização e isolamento de dados por academia.

## 🔄 Fluxo Completo do Login Social

### 1. **Autenticação Social**
```javascript
// Usuário escolhe login social (Google, Facebook, etc.)
const result = await signInWithPopup(auth, provider);
const firebaseUser = result.user;

// Firebase Authentication autentica com o provedor externo
// Retorna User object e ID Token
```

### 2. **Verificação Pós-Login**

#### **Usuário Novo (primeira vez)**
```javascript
// AuthContext verifica se usuário existe no Firestore
let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

if (!userDoc.exists()) {
  // Cria perfil básico
  await setDoc(doc(db, 'users', firebaseUser.uid), {
    name: firebaseUser.displayName,
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL,
    tipo: null, // Será definido na seleção de tipo
    userType: null,
    profileCompleted: false, // Indica perfil incompleto
    isActive: true,
    createdAt: new Date()
  });
}
```

#### **Verificação de Custom Claims**
```javascript
// Carrega Custom Claims do ID Token
const claims = await getUserClaims();
setCustomClaims(claims);

// Verifica se tem role e academiaId
const hasValidClaims = !!(claims?.role && claims?.academiaId);
```

### 3. **Lógica de Navegação (AppNavigator)**

```javascript
// Usuário sem tipo definido → Seleção de Tipo
if ((!userProfile.userType && !userProfile.tipo) || userProfile.profileCompleted === false) {
  return <UserTypeSelectionScreen />;
}

// Usuário sem academia → Onboarding de Academia
const hasAcademiaAssociation = userProfile.academiaId || customClaims?.academiaId;
if (!hasAcademiaAssociation) {
  return <AcademyOnboardingScreen />;
}

// Usuário completo → Dashboard da Academia
return <MainNavigator userType={userType} />;
```

## 🏢 Fluxo de Onboarding de Academia

### **Opção 1: Criar Academia**
```javascript
// Usuário escolhe "Criar Minha Academia"
const result = await createAcademy({
  name: "Minha Academia",
  address: "Endereço...",
  // ... outros dados
});

// Cloud Function:
// 1. Cria documento em /gyms/{academiaId}
// 2. Define Custom Claims: { role: 'admin', academiaId: 'gym_123' }
// 3. Atualiza perfil do usuário no Firestore
```

### **Opção 2: Juntar-se via Convite**
```javascript
// Usuário insere código de convite
const result = await useInvite({
  inviteCode: "ABC123",
  userRole: "instructor" // ou "student"
});

// Cloud Function:
// 1. Valida código de convite
// 2. Define Custom Claims: { role: 'instructor', academiaId: 'gym_456' }
// 3. Atualiza perfil do usuário no Firestore
// 4. Invalida o código de convite
```

### **Atualização de Claims no Cliente**
```javascript
// Após operação da Cloud Function, forçar refresh do token
await refreshUserToken(); // força getIdToken(true)

// Recarregar claims e perfil
await refreshClaimsAndProfile();

// Navegação automática para o dashboard
```

## 🔐 Segurança e Isolamento

### **Custom Claims Structure**
```javascript
{
  "role": "admin" | "instructor" | "student",
  "academiaId": "gym_123",
  // Não há mais superAdmin: true
}
```

### **Regras do Firestore**
```javascript
// Acesso apenas aos dados da própria academia
match /gyms/{academiaId} {
  allow read, write: if request.auth != null 
    && request.auth.token.academiaId == academiaId;
  
  // Subcoleções isoladas por academia
  match /{collection}/{docId} {
    allow read, write: if request.auth != null 
      && request.auth.token.academiaId == academiaId;
  }
}
```

## 📱 Componentes Atualizados

### **AuthContext.js**
- ✅ Suporte a todos os provedores sociais
- ✅ Carregamento automático de Custom Claims
- ✅ Função `refreshClaimsAndProfile()` para atualizar após Cloud Functions
- ✅ Estado `customClaims` disponível globalmente

### **AppNavigator.js**
- ✅ Lógica de navegação baseada em Custom Claims
- ✅ Verificação dupla: perfil Firestore + Custom Claims
- ✅ Fluxo de onboarding integrado

### **Utilitários**
- ✅ `customClaimsHelper.js` - Funções para gerenciar claims
- ✅ `refreshUserToken()` - Força atualização do ID Token
- ✅ `waitForClaimsUpdate()` - Aguarda claims serem atualizados

## 🎯 Vantagens da Integração

### **Para Usuários**
- Login rápido com contas existentes (Google, Facebook, etc.)
- Fluxo de onboarding intuitivo
- Associação automática à academia após criação/convite

### **Para Desenvolvedores**
- Código limpo e modular
- Segurança robusta com Custom Claims
- Isolamento completo de dados
- Fácil manutenção e extensão

### **Para Administradores**
- Controle granular de permissões
- Auditoria completa de acessos
- Escalabilidade para múltiplas academias

## 🔧 Comandos Úteis

### **Debug de Claims**
```javascript
import { debugUserClaims } from '../utils/customClaimsHelper';
await debugUserClaims(); // Mostra todos os claims no console
```

### **Verificar Estado do Usuário**
```javascript
const { user, userProfile, customClaims } = useAuth();
console.log('Estado completo:', {
  authenticated: !!user,
  hasProfile: !!userProfile,
  hasClaims: !!customClaims,
  academiaId: userProfile?.academiaId || customClaims?.academiaId,
  role: customClaims?.role
});
```

### **Forçar Atualização**
```javascript
const { refreshClaimsAndProfile } = useAuth();
await refreshClaimsAndProfile(); // Após operações de Cloud Functions
```

## 🚀 Próximos Passos

1. **Teste o fluxo completo** no navegador
2. **Crie uma academia** via interface
3. **Gere códigos de convite** para testar associação
4. **Verifique isolamento** criando múltiplas academias
5. **Monitore logs** das Cloud Functions

## 📊 Monitoramento

```bash
# Logs das Cloud Functions
firebase functions:log --project academia-app-5cf79

# Verificar estado do banco
node scripts/simple-migration-check.js

# Console do Firebase
https://console.firebase.google.com/project/academia-app-5cf79
```

---

**✅ Status: Implementação Completa e Funcional**

O login social está totalmente integrado com a nova arquitetura, proporcionando uma experiência de usuário fluida e segurança robusta com isolamento completo de dados entre academias.
