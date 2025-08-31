# Guia de Deploy - Academia App

## Pré-requisitos

### 1. Configuração do Firebase
Antes de fazer o deploy, configure o Firebase:

1. **Criar projeto no Firebase Console**
   - Acesse https://console.firebase.google.com
   - Crie um novo projeto
   - Ative Authentication, Firestore e Storage

2. **Configurar Authentication**
   - Ative Email/Password
   - Configure Google Sign-in (opcional)
   - Configure domínios autorizados

3. **Configurar Firestore**
   - Crie o banco de dados
   - Implemente as regras de segurança do arquivo `firestore.rules`

4. **Obter credenciais**
   - Baixe o arquivo `google-services.json` (Android)
   - Baixe o arquivo `GoogleService-Info.plist` (iOS)
   - Copie as configurações web para `src/services/firebase.js`

### 2. Configuração do Expo
```bash
# Instalar Expo CLI
npm install -g @expo/cli

# Login no Expo
expo login
```

## Configuração do Projeto

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Firebase
Edite o arquivo `src/services/firebase.js` com suas credenciais:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "sua-app-id"
};
```

### 3. Configurar Google Sign-in (Opcional)
Se usar login com Google, configure no `app.json`:

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

## Deploy para Desenvolvimento

### 1. Executar localmente
```bash
# Iniciar servidor de desenvolvimento
expo start

# Para Android
expo start --android

# Para iOS
expo start --ios
```

### 2. Testar em dispositivo físico
- Instale o app Expo Go no seu dispositivo
- Escaneie o QR code gerado

## Deploy para Produção

### 1. Build para Android (APK)
```bash
# Build de desenvolvimento
expo build:android -t apk

# Build de produção
expo build:android -t app-bundle
```

### 2. Build para iOS
```bash
# Build para iOS
expo build:ios
```

### 3. Deploy usando EAS Build (Recomendado)
```bash
# Instalar EAS CLI
npm install -g @expo/eas-cli

# Login no EAS
eas login

# Configurar projeto
eas build:configure

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios

# Submit para stores
eas submit --platform android
eas submit --platform ios
```

## Configurações de Produção

### 1. Variáveis de Ambiente
Crie um arquivo `.env` (não commitado):
```
FIREBASE_API_KEY=sua-api-key
FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu-projeto-id
```

### 2. Configurar app.json para produção
```json
{
  "expo": {
    "name": "Academia App",
    "slug": "academia-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#2196F3"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.suaempresa.academiaapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#2196F3"
      },
      "package": "com.suaempresa.academiaapp"
    }
  }
}
```

## Checklist de Deploy

### Antes do Deploy
- [ ] Configurar Firebase corretamente
- [ ] Testar todas as funcionalidades principais
- [ ] Verificar regras de segurança do Firestore
- [ ] Configurar ícones e splash screen
- [ ] Testar em dispositivos Android e iOS
- [ ] Verificar performance da aplicação

### Deploy
- [ ] Build de produção sem erros
- [ ] Testar build em dispositivos reais
- [ ] Configurar stores (Google Play/App Store)
- [ ] Preparar screenshots e descrições
- [ ] Submit para review

### Pós-Deploy
- [ ] Monitorar crashes e erros
- [ ] Configurar analytics (opcional)
- [ ] Preparar sistema de feedback
- [ ] Documentar processo de atualização

## Troubleshooting

### Problemas Comuns

1. **Erro de autenticação Firebase**
   - Verificar se as credenciais estão corretas
   - Confirmar se os domínios estão autorizados

2. **Erro de build**
   - Limpar cache: `expo r -c`
   - Verificar versões das dependências
   - Verificar configurações do app.json

3. **Problemas de permissões**
   - Verificar regras do Firestore
   - Confirmar configurações de segurança

4. **Performance lenta**
   - Otimizar queries do Firestore
   - Implementar paginação
   - Usar lazy loading

## Monitoramento

### Firebase Analytics
Configure o Firebase Analytics para monitorar:
- Uso das funcionalidades
- Crashes da aplicação
- Performance das telas

### Crashlytics
Configure o Crashlytics para:
- Relatórios de crash automáticos
- Monitoramento de erros em tempo real
- Análise de estabilidade

## Atualizações

### Over-the-Air Updates (OTA)
```bash
# Publicar atualização
expo publish

# Com EAS Update
eas update
```

### Atualizações da Store
Para mudanças que requerem nova versão:
1. Incrementar versão no app.json
2. Fazer novo build
3. Submit para as stores

## Suporte

Para problemas específicos:
1. Consulte a documentação do Expo
2. Verifique os logs do Firebase Console
3. Use o Expo CLI para debugging
4. Consulte a comunidade Expo no Discord/Forum
