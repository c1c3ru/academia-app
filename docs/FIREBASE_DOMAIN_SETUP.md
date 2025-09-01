# Configuração de Domínios Autorizados no Firebase

## Problema Identificado

O erro `400 (Bad Request)` na URL `identitytoolkit.googleapis.com` pode estar relacionado à configuração de domínios autorizados no Firebase Console.

## Solução

### 1. Verificar Domínios Autorizados

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Selecione o projeto `academia-app-5cf79`
3. Vá em **Authentication** > **Settings** > **Authorized domains**
4. Verifique se os seguintes domínios estão listados:

```
localhost
academia-app-5cf79.firebaseapp.com
```

### 2. Adicionar Domínios Necessários

Se algum domínio estiver faltando, adicione:

- **Para desenvolvimento local**: `localhost`
- **Para Expo Web**: `localhost:19006` (se estiver usando Expo)
- **Para produção**: Seu domínio de produção

### 3. Configuração para React Native/Expo

Para React Native com Expo, você pode precisar adicionar:

```
localhost
localhost:19006
localhost:3000
```

### 4. Verificar Configuração de OAuth

1. Vá em **Authentication** > **Sign-in method**
2. Verifique se **Email/Password** está habilitado
3. Verifique se não há restrições de domínio

### 5. Teste de Configuração

Execute o script de teste para verificar se a configuração está correta:

```bash
node scripts/test-web-auth.js
```

## Troubleshooting

### Erro 400 (Bad Request)

**Possíveis causas:**
- Domínio não autorizado
- API Key inválida
- Configuração incorreta do projeto

**Soluções:**
1. Verificar domínios autorizados
2. Verificar API Key no Firebase Console
3. Verificar se o projeto está ativo

### Erro auth/invalid-credential

**Possíveis causas:**
- Credenciais incorretas
- Problema de formatação
- Problema de encoding

**Soluções:**
1. Verificar se email e senha estão corretos
2. Limpar espaços extras
3. Verificar encoding dos dados

## Verificação Rápida

Para verificar se a configuração está correta:

1. **Teste no Node.js**: `node scripts/test-user-login.js`
2. **Teste no Web**: `node scripts/test-web-auth.js`
3. **Teste no App**: Verificar logs do console

Se os testes 1 e 2 funcionarem mas o 3 não, o problema está na configuração do React Native/Expo. 