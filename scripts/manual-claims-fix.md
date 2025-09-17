# Correção Manual de Custom Claims

## Problema Identificado
O usuário tem `academiaId: Tgg6tZynnTbQUxeAFJAB` no perfil do Firestore, mas não tem Custom Claims configurados, causando erro "Missing or insufficient permissions" ao acessar dados da academia.

## Solução Rápida via Console Firebase

### 1. Acesse o Console Firebase
- Vá para: https://console.firebase.google.com/project/academia-app-5cf79
- Entre na seção **Authentication** > **Users**

### 2. Encontre o Usuário
- Procure pelo usuário com problema (email: cicerosilva.ifce@gmail.com)
- Clique no usuário para ver detalhes

### 3. Definir Custom Claims
- Na seção **Custom claims**, adicione:
```json
{
  "role": "admin",
  "academiaId": "Tgg6tZynnTbQUxeAFJAB"
}
```

### 4. Salvar e Testar
- Salve as alterações
- O usuário precisa fazer logout/login ou aguardar atualização automática do token

## Solução Automática via Cloud Function

### Opção 1: Usar a função fixUserClaims
Execute no console do navegador quando logado como admin:

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const fixUserClaims = httpsCallable(functions, 'fixUserClaims');

// Substitua pelo UID do usuário
const userId = 'UID_DO_USUARIO_AQUI';

fixUserClaims({ userId })
  .then((result) => {
    console.log('✅ Claims corrigidos:', result.data);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
  });
```

### Opção 2: Migração completa
Execute no console do navegador quando logado como admin:

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const migrateUsers = httpsCallable(functions, 'migrateExistingUsers');

migrateUsers()
  .then((result) => {
    console.log('✅ Migração concluída:', result.data);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
  });
```

## Verificação
Após corrigir os claims, o usuário deve conseguir:
- Acessar dados da academia
- Ver notificações
- Navegar pelo app sem erros de permissão

## Próximos Passos
1. Corrigir claims do usuário atual
2. Executar migração completa para todos os usuários
3. Testar fluxo de onboarding para novos usuários
4. Verificar regras de segurança do Firestore
