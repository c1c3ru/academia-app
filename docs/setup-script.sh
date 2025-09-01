#!/bin/bash

# Script de Configuração e Instalação do Ambiente
# Academia App - Aplicativo de Gerenciamento para Academias de Lutas

echo "🥋 Academia App - Script de Configuração"
echo "========================================"

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    echo "   Visite: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node -v)"

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale o npm primeiro."
    exit 1
fi

echo "✅ npm encontrado: $(npm -v)"

# Criar diretório do projeto
PROJECT_NAME="academia-app"
echo "📁 Criando projeto: $PROJECT_NAME"

# Verificar se o diretório já existe
if [ -d "$PROJECT_NAME" ]; then
    echo "⚠️  Diretório $PROJECT_NAME já existe. Deseja continuar? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Operação cancelada."
        exit 1
    fi
    echo "🗑️  Removendo diretório existente..."
    rm -rf "$PROJECT_NAME"
fi

# Criar projeto Expo
echo "🚀 Criando projeto React Native com Expo..."
npx create-expo-app "$PROJECT_NAME" --template blank

if [ $? -ne 0 ]; then
    echo "❌ Erro ao criar projeto Expo."
    exit 1
fi

cd "$PROJECT_NAME"

echo "✅ Projeto Expo criado com sucesso!"

# Instalar dependências do Firebase
echo "🔥 Instalando Firebase SDK..."
npm install firebase

# Instalar dependências de navegação
echo "🧭 Instalando dependências de navegação..."
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack react-native-screens react-native-safe-area-context

# Instalar dependências de UI
echo "🎨 Instalando dependências de UI..."
npm install react-native-paper react-native-elements react-native-vector-icons

# Instalar dependências adicionais
echo "📱 Instalando dependências adicionais..."
npm install react-native-image-picker react-native-calendars

# Criar estrutura de pastas
echo "📂 Criando estrutura de pastas..."
mkdir -p src/{components,screens,services,utils,contexts,navigation}
mkdir -p src/screens/{auth,student,instructor,admin,shared}

echo "✅ Dependências instaladas com sucesso!"

# Criar arquivo de configuração do Firebase
echo "🔧 Criando arquivo de configuração do Firebase..."
cat > src/config/firebase.js << 'EOF'
// Configuração do Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// IMPORTANTE: Substitua pelas suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
EOF

# Criar arquivo de regras do Firestore
echo "🔒 Criando arquivo de regras do Firestore..."
cat > firestore.rules << 'EOF'
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
EOF

# Criar README com instruções
echo "📖 Criando README com instruções..."
cat > README.md << 'EOF'
# Academia App

Aplicativo de gerenciamento para academias de lutas desenvolvido com React Native e Firebase.

## 🚀 Configuração Inicial

### 1. Configurar Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Adicione um aplicativo web ao projeto
4. Copie as credenciais de configuração
5. Substitua as credenciais no arquivo `src/config/firebase.js`

### 2. Configurar Firestore

1. No console do Firebase, vá para Firestore Database
2. Crie um banco de dados
3. Copie as regras do arquivo `firestore.rules` para as regras do Firestore

### 3. Configurar Authentication

1. No console do Firebase, vá para Authentication
2. Ative os métodos de login:
   - Email/Senha
   - Google (opcional)

### 4. Configurar Storage

1. No console do Firebase, vá para Storage
2. Configure as regras de segurança para upload de imagens

## 🏃‍♂️ Executar o Projeto

```bash
# Instalar dependências
npm install

# Executar no desenvolvimento
npm start

# Executar no Android
npm run android

# Executar no iOS (requer macOS)
npm run ios

# Executar na web
npm run web
```

## 📱 Funcionalidades

### Para Alunos
- Dashboard com resumo de atividades
- Check-in em aulas
- Visualização de pagamentos
- Timeline de evolução/graduações
- Calendário de aulas
- Mural de avisos

### Para Professores
- Painel de check-in em tempo real
- Gestão de alunos
- Registro de graduações
- Visualização de turmas

### Para Administradores
- Gestão completa de alunos
- CRUD de modalidades, planos e turmas
- Gestão de pagamentos
- Criação de avisos
- Relatórios e dashboard

## 🛠️ Tecnologias Utilizadas

- React Native
- Expo
- Firebase (Auth, Firestore, Storage)
- React Navigation
- React Native Paper
- React Native Elements

## 📄 Licença

Este projeto está sob a licença MIT.
EOF

echo ""
echo "🎉 Configuração concluída com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o Firebase seguindo as instruções no README.md"
echo "2. Substitua as credenciais em src/config/firebase.js"
echo "3. Execute 'npm start' para iniciar o desenvolvimento"
echo ""
echo "📁 Estrutura do projeto criada em: $(pwd)"
echo ""
echo "🔗 Links úteis:"
echo "   - Console do Firebase: https://console.firebase.google.com/"
echo "   - Documentação do Expo: https://docs.expo.dev/"
echo "   - Documentação do React Native: https://reactnative.dev/"
echo ""
echo "✨ Bom desenvolvimento!"

