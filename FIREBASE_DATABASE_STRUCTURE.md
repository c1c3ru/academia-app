# Estrutura do Banco de Dados Firebase Firestore

## 📋 **Coleções Principais**

### 1. **users** (Usuários)
```
users/{userId}
├── name: string
├── email: string
├── phone: string
├── userType: string ('student' | 'instructor' | 'admin')
├── isActive: boolean
├── currentGraduation: string (apenas para alunos)
├── graduations: array
├── classIds: array
├── createdAt: timestamp
├── updatedAt: timestamp
├── profileImage?: string
└── bio?: string
```

### 2. **classes** (Turmas/Aulas)
```
classes/{classId}
├── name: string
├── description: string
├── modalityId: string (referência para modalities)
├── instructorId: string (referência para users)
├── schedule: object
│   ├── dayOfWeek: number (0-6)
│   ├── startTime: string
│   └── endTime: string
├── maxStudents: number
├── currentStudents: number
├── studentIds: array
├── isActive: boolean
├── createdAt: timestamp
└── updatedAt: timestamp
```

### 3. **modalities** (Modalidades)
```
modalities/{modalityId}
├── name: string
├── description: string
├── graduationLevels: array
├── monthlyPrice: number
├── isActive: boolean
├── createdAt: timestamp
└── updatedAt: timestamp
```

### 4. **payments** (Pagamentos)
```
payments/{paymentId}
├── studentId: string (referência para users)
├── amount: number
├── dueDate: timestamp
├── paidDate?: timestamp
├── status: string ('pending' | 'paid' | 'overdue')
├── method?: string
├── description: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

### 5. **checkins** (Check-ins)
```
checkins/{checkinId}
├── studentId: string (referência para users)
├── classId: string (referência para classes)
├── date: timestamp
├── status: string ('present' | 'absent' | 'late')
├── notes?: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

### 6. **graduations** (Graduações)
```
graduations/{graduationId}
├── studentId: string (referência para users)
├── modalityId: string (referência para modalities)
├── fromLevel: string
├── toLevel: string
├── date: timestamp
├── instructorId: string (referência para users)
├── notes?: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

### 7. **announcements** (Anúncios)
```
announcements/{announcementId}
├── title: string
├── content: string
├── authorId: string (referência para users)
├── targetAudience: string ('all' | 'students' | 'instructors')
├── isActive: boolean
├── priority: string ('low' | 'medium' | 'high')
├── expiresAt?: timestamp
├── createdAt: timestamp
└── updatedAt: timestamp
```

### 8. **notifications** (Notificações)
```
notifications/{notificationId}
├── userId: string (referência para users)
├── title: string
├── message: string
├── type: string ('payment' | 'class' | 'graduation' | 'general')
├── isRead: boolean
├── data?: object
├── createdAt: timestamp
└── updatedAt: timestamp
```

## 🔐 **Regras de Segurança**

### Permissões por Tipo de Usuário:

**Alunos (students):**
- ✅ Ler seus próprios dados
- ✅ Atualizar perfil próprio
- ✅ Ler turmas que participa
- ✅ Ler modalidades ativas
- ✅ Ler seus pagamentos
- ✅ Ler seus check-ins
- ✅ Ler anúncios públicos

**Professores (instructors):**
- ✅ Todas as permissões de aluno
- ✅ Ler dados dos alunos de suas turmas
- ✅ Criar/editar check-ins de suas turmas
- ✅ Ler/criar graduações de seus alunos
- ✅ Criar anúncios para alunos

**Administradores (admin):**
- ✅ Acesso total a todas as coleções
- ✅ Criar/editar/deletar qualquer documento
- ✅ Gerenciar usuários e permissões

## 📊 **Índices Recomendados**

```javascript
// Índices compostos para otimização
users: ['userType', 'isActive']
classes: ['instructorId', 'isActive']
payments: ['studentId', 'status', 'dueDate']
checkins: ['classId', 'date']
notifications: ['userId', 'isRead', 'createdAt']
```

## 🚀 **Comandos para Criar a Estrutura**

Execute no Firebase Console:

```javascript
// Criar coleção de modalidades padrão
db.collection('modalities').add({
  name: 'Judô',
  description: 'Arte marcial japonesa focada em técnicas de projeção e imobilização',
  graduationLevels: ['Branca', 'Amarela', 'Laranja', 'Verde', 'Roxa', 'Marrom', 'Preta'],
  monthlyPrice: 150.00,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Criar usuário admin padrão (após registro)
db.collection('users').doc('admin-user-id').update({
  userType: 'admin',
  isActive: true
});
```

## 📝 **Observações Importantes**

1. **IDs Automáticos**: Use `doc()` sem parâmetro para IDs automáticos
2. **Timestamps**: Use `serverTimestamp()` para timestamps consistentes
3. **Referências**: Use strings com IDs para referências entre documentos
4. **Arrays**: Limite arrays a 1000 elementos máximo
5. **Subcoleções**: Considere usar para dados relacionados grandes
6. **Backup**: Configure backup automático no Firebase Console

## 🔄 **Migração de Dados**

Para migrar dados existentes:

```javascript
// Script de migração (executar no Firebase Functions)
const migrateData = async () => {
  // Migrar usuários existentes
  const users = await db.collection('users').get();
  
  users.forEach(async (doc) => {
    await doc.ref.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
};
```
