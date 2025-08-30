# 🔥 Configuração do Firebase - Guia Completo

## ⚠️ IMPORTANTE: Configurar Credenciais Reais

O projeto está configurado com credenciais de exemplo. Para funcionar corretamente, você precisa configurar suas próprias credenciais do Firebase.

## 📋 Passos para Configuração

### 1. Criar Projeto no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Adicionar projeto"
3. Digite o nome do projeto (ex: "Academia App")
4. Configure Google Analytics (opcional)
5. Clique em "Criar projeto"

### 2. Configurar Authentication

1. No painel do Firebase, vá em **Authentication**
2. Clique na aba **Sign-in method**
3. Ative os provedores:
   - ✅ **Email/Password** (obrigatório)
   - ✅ **Google** (opcional, para login social)

### 3. Configurar Firestore Database

1. Vá em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (por enquanto)
4. Selecione a localização (ex: southamerica-east1)
5. Clique em "Concluído"

### 4. Configurar Storage

1. Vá em **Storage**
2. Clique em "Começar"
3. Aceite as regras padrão
4. Selecione a localização
5. Clique em "Concluído"

### 5. Obter Credenciais Web

1. Vá em **Configurações do projeto** (ícone de engrenagem)
2. Na aba **Geral**, role até "Seus apps"
3. Clique no ícone **Web** (`</>`)
4. Digite um nome para o app: "Academia App Web"
5. **NÃO** marque "Firebase Hosting"
6. Clique em "Registrar app"
7. **COPIE** as credenciais mostradas

### 6. Configurar Credenciais no Projeto

Edite o arquivo `src/services/firebase.js` e substitua:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_REAL_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 7. Configurar Regras de Segurança

#### Firestore Rules
Vá em **Firestore Database > Regras** e cole o conteúdo do arquivo `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras já implementadas no arquivo firestore.rules
    // Copie e cole o conteúdo completo
  }
}
```

#### Storage Rules
Vá em **Storage > Regras**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🔧 Configuração Adicional (Opcional)

### Para Login com Google

1. No Firebase Console, vá em **Authentication > Sign-in method**
2. Clique em **Google**
3. Ative o provedor
4. Configure o email de suporte
5. Baixe o arquivo de configuração:
   - **Android**: `google-services.json`
   - **iOS**: `GoogleService-Info.plist`

### Configurar no app.json (para Google Login)

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

## ✅ Verificar Configuração

Após configurar as credenciais:

1. Reinicie o servidor Expo: `npx expo start --clear`
2. Teste o cadastro de um usuário
3. Verifique se o usuário aparece em **Authentication > Users**
4. Teste o login

## 🚨 Problemas Comuns

### Erro: "auth/api-key-not-valid"
- ✅ Verifique se copiou a API Key corretamente
- ✅ Confirme se não há espaços extras
- ✅ Certifique-se de que o projeto está ativo no Firebase

### Erro: "auth/project-not-found"
- ✅ Verifique o Project ID
- ✅ Confirme se o projeto existe no Firebase Console

### Erro: "auth/app-not-authorized"
- ✅ Verifique o App ID
- ✅ Confirme se o app foi registrado no projeto

## 📞 Suporte

Se encontrar problemas:
1. Verifique o [Firebase Documentation](https://firebase.google.com/docs)
2. Consulte os logs no Firebase Console
3. Verifique se todos os serviços estão ativos

---

**⚡ Após configurar corretamente, o app funcionará sem erros de autenticação!**
