# 🔒 Configuração das Regras de Segurança do Firestore

## ⚠️ URGENTE: Configurar Regras de Segurança

O erro "Missing or insufficient permissions" indica que o Firestore está em modo de produção com regras restritivas. Você precisa implementar as regras de segurança corretas.

## 📋 Passos para Configurar as Regras

### 1. Acessar o Firebase Console

1. Vá para [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto: **academia-app-5cf79**
3. No menu lateral, clique em **Firestore Database**
4. Clique na aba **Regras** (Rules)

### 2. Substituir as Regras Atuais

**COPIE E COLE** o conteúdo completo abaixo no editor de regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regras para usuários
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && isAdmin();
    }
    
    // Regras para alunos
    match /students/{studentId} {
      allow read: if request.auth != null && request.auth.uid == studentId;
      allow read: if request.auth != null && isInstructor() && isStudentOfInstructor(studentId);
      allow read, write: if request.auth != null && isAdmin();
      allow write: if request.auth != null && isInstructor() && isStudentOfInstructor(studentId);
    }
    
    // Regras para turmas
    match /classes/{classId} {
      allow read: if request.auth != null && isStudentInClass(classId);
      allow read, write: if request.auth != null && isInstructorOfClass(classId);
      allow read, write: if request.auth != null && isAdmin();
    }
    
    // Regras para pagamentos
    match /payments/{paymentId} {
      allow read: if request.auth != null && resource.data.studentId == request.auth.uid;
      allow read, write: if request.auth != null && isAdmin();
    }
    
    // Regras para check-ins
    match /checkIns/{checkInId} {
      allow create: if request.auth != null && request.resource.data.studentId == request.auth.uid;
      allow read: if request.auth != null && isInstructorOfClass(resource.data.classId);
      allow read: if request.auth != null && isAdmin();
    }
    
    // Regras para modalidades, planos e avisos
    match /{collection}/{document} {
      allow read: if request.auth != null && collection in ['modalities', 'plans', 'announcements', 'events'];
      allow write: if request.auth != null && isAdmin() && collection in ['modalities', 'plans', 'announcements', 'events'];
    }
    
    // Funções auxiliares
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'admin';
    }
    
    function isInstructor() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'instructor';
    }
    
    function isStudentOfInstructor(studentId) {
      let studentData = get(/databases/$(database)/documents/users/$(studentId)).data;
      let instructorData = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return studentData.instructorId == request.auth.uid || 
             studentData.classIds.hasAny(instructorData.classIds);
    }
    
    function isStudentInClass(classId) {
      let userData = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return userData.classIds.hasAny([classId]);
    }
    
    function isInstructorOfClass(classId) {
      let classData = get(/databases/$(database)/documents/classes/$(classId)).data;
      return classData.instructorId == request.auth.uid;
    }
  }
}
```

### 3. Publicar as Regras

1. Após colar o código, clique em **Publicar** (Publish)
2. Confirme a publicação das novas regras
3. Aguarde alguns segundos para as regras serem aplicadas

## 🚨 Regras Temporárias para Teste (APENAS PARA DESENVOLVIMENTO)

Se você quiser testar rapidamente, pode usar regras mais permissivas temporariamente:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ IMPORTANTE**: Use as regras temporárias APENAS para teste. Sempre implemente as regras de segurança completas em produção.

## ✅ Verificar se Funcionou

Após configurar as regras:

1. Reinicie o app: `npx expo start --clear`
2. Tente fazer cadastro de um usuário
3. Tente fazer login
4. Verifique se não há mais erros de permissão

## 🔍 Estrutura das Regras Implementadas

### Permissões por Tipo de Usuário:

**👤 Usuários Comuns:**
- Podem ler/escrever seus próprios dados
- Podem ler dados públicos (modalidades, planos, avisos)

**🎓 Alunos:**
- Podem ver suas próprias informações
- Podem ver turmas em que estão matriculados
- Podem fazer check-in nas aulas
- Podem ver seus pagamentos

**👨‍🏫 Instrutores:**
- Podem ver alunos de suas turmas
- Podem gerenciar suas turmas
- Podem ver check-ins de suas aulas
- Podem atualizar dados de seus alunos

**👑 Administradores:**
- Acesso total a todos os dados
- Podem gerenciar usuários, turmas, pagamentos
- Podem criar/editar modalidades, planos, avisos

## 🛠 Troubleshooting

### Se ainda houver erros:

1. **Verifique se as regras foram publicadas**
2. **Aguarde 1-2 minutos** para propagação
3. **Limpe o cache**: `npx expo start --clear`
4. **Verifique se o usuário está autenticado** antes de fazer operações

### Logs úteis:
- Vá em **Firestore Database > Uso**
- Verifique se há tentativas de acesso negadas
- Analise os logs de segurança

---

**🔥 Após configurar as regras, o app funcionará completamente!**
