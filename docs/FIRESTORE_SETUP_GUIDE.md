# 🔥 Guia de Configuração do Firebase Firestore

## 🚨 **AÇÃO URGENTE NECESSÁRIA**

O app está apresentando erros de permissão do Firestore. Siga este guia para configurar corretamente:

## 📋 **Passo 1: Aplicar Regras de Segurança**

1. **Acesse o Firebase Console**: https://console.firebase.google.com
2. **Selecione seu projeto**
3. **Vá em Firestore Database**
4. **Clique na aba "Rules"**
5. **Substitua o conteúdo por estas regras:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Função para verificar se o usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Função para verificar o tipo de usuário
    function getUserType() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType;
    }
    
    // Função para verificar se é admin
    function isAdmin() {
      return isAuthenticated() && getUserType() == 'admin';
    }
    
    // Função para verificar se é instrutor
    function isInstructor() {
      return isAuthenticated() && getUserType() == 'instructor';
    }
    
    // Função para verificar se é aluno
    function isStudent() {
      return isAuthenticated() && getUserType() == 'student';
    }
    
    // Regras para usuários
    match /users/{userId} {
      allow read, write: if isAuthenticated() && (
        request.auth.uid == userId || isAdmin()
      );
      allow read: if isInstructor() && resource.data.userType == 'student';
    }
    
    // Regras para turmas
    match /classes/{classId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || (isInstructor() && resource.data.instructorId == request.auth.uid);
    }
    
    // Regras para modalidades
    match /modalities/{modalityId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Regras para pagamentos
    match /payments/{paymentId} {
      allow read: if isAuthenticated() && (
        resource.data.studentId == request.auth.uid || isAdmin() || isInstructor()
      );
      allow write: if isAdmin();
    }
    
    // Regras para check-ins
    match /checkins/{checkinId} {
      allow read: if isAuthenticated() && (
        resource.data.studentId == request.auth.uid || isAdmin() || isInstructor()
      );
      allow write: if isAdmin() || isInstructor();
    }
    
    // Regras para graduações
    match /graduations/{graduationId} {
      allow read: if isAuthenticated() && (
        resource.data.studentId == request.auth.uid || isAdmin() || isInstructor()
      );
      allow write: if isAdmin() || isInstructor();
    }
    
    // Regras para anúncios
    match /announcements/{announcementId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || isInstructor();
    }
    
    // Regras para notificações
    match /notifications/{notificationId} {
      allow read, write: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow write: if isAdmin();
    }
  }
}
```

6. **Clique em "Publish"**

## 📊 **Passo 2: Criar Coleções Iniciais**

Execute estes comandos no **Console do Firebase** (aba Console):

```javascript
// 1. Criar modalidade padrão de Judô
db.collection('modalities').add({
  name: 'Judô',
  description: 'Arte marcial japonesa focada em técnicas de projeção e imobilização ',
  graduationLevels: ['Branca', 'Amarela', 'Laranja', 'Verde', 'Roxa', 'Marrom', 'Preta'],
  monthlyPrice: 150.00,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 2. Criar modalidade de Karatê
db.collection('modalities').add({
  name: 'Karatê',
  description: 'Arte marcial japonesa focada em golpes de punho e chutes',
  graduationLevels: ['Branca', 'Amarela', 'Vermelha', 'Laranja', 'Verde', 'Roxa', 'Marrom', 'Preta'],
  monthlyPrice: 140.00,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 3. Criar anúncio de boas-vindas
db.collection('announcements').add({
  title: 'Bem-vindos à Academia!',
  content: 'Estamos felizes em tê-los conosco. Vamos treinar juntos!',
  authorId: 'system',
  targetAudience: 'all',
  isActive: true,
  priority: 'medium',
  createdAt: new Date(),
  updatedAt: new Date()
});
```

## 🔧 **Passo 3: Configurar Índices**

No Firebase Console, vá em **Firestore Database > Indexes** e crie:

1. **Índice para users:**
   - Collection: `users`
   - Fields: `userType` (Ascending), `isActive` (Ascending)

2. **Índice para classes:**
   - Collection: `classes`
   - Fields: `instructorId` (Ascending), `isActive` (Ascending)

3. **Índice para payments:**
   - Collection: `payments`
   - Fields: `studentId` (Ascending), `status` (Ascending), `dueDate` (Ascending)

4. **Índice para checkins:**
   - Collection: `checkins`
   - Fields: `classId` (Ascending), `date` (Descending)

5. **Índice para notifications:**
   - Collection: `notifications`
   - Fields: `userId` (Ascending), `isRead` (Ascending), `createdAt` (Descending)

## ✅ **Passo 4: Verificar Configuração**

1. **Recarregue o app** (pressione `r` no terminal)
2. **Teste o cadastro** de um usuário
3. **Verifique se não há mais erros** de permissão
4. **Teste login** com diferentes tipos de usuário

## 🚨 **Erros Comuns e Soluções**

### Erro: "Missing or insufficient permissions"
- ✅ **Solução**: Aplicar as regras de segurança acima
- ✅ **Verificar**: Se o usuário está autenticado
- ✅ **Confirmar**: Se as regras foram publicadas

### Erro: "Collection doesn't exist"
- ✅ **Solução**: Criar as coleções iniciais
- ✅ **Verificar**: Se os documentos foram criados corretamente

### Erro: "Index not found"
- ✅ **Solução**: Criar os índices recomendados
- ✅ **Aguardar**: Alguns minutos para os índices serem criados

## 📞 **Suporte**

Se ainda houver problemas:
1. Verifique o console do Firebase para erros
2. Confirme se o projeto Firebase está ativo
3. Verifique se a configuração do Firebase no app está correta
4. Teste com um usuário admin primeiro

**⚠️ IMPORTANTE: Execute estes passos AGORA para resolver os erros de permissão!**
