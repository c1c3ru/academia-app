# Correção Manual de Custom Claims via Console Firebase

## Problema
Usuário `EXjQ5utfSGRBd9pQJVFmts5DxtC3` tem `academiaId: Tgg6tZynnTbQUxeAFJAB` no perfil mas não tem Custom Claims, causando erro "Missing or insufficient permissions".

## Solução Rápida via Console Firebase

### 1. Acesse o Console Firebase
- URL: https://console.firebase.google.com/project/academia-app-5cf79
- Faça login com sua conta Google

### 2. Vá para Authentication
- No menu lateral, clique em **Authentication**
- Clique na aba **Users**

### 3. Encontre o Usuário
- Procure pelo usuário com UID: `EXjQ5utfSGRBd9pQJVFmts5DxtC3`
- Ou procure pelo email: `cicerosilva.ifce@gmail.com`

### 4. Editar Custom Claims
- Clique no usuário para abrir os detalhes
- Role para baixo até a seção **Custom claims**
- Clique em **Edit**

### 5. Adicionar Claims
Cole exatamente este JSON:
```json
{
  "role": "admin",
  "academiaId": "Tgg6tZynnTbQUxeAFJAB"
}
```

### 6. Salvar
- Clique em **Save**
- Aguarde a confirmação

### 7. Verificar no App
- Recarregue o app principal
- O usuário deve conseguir acessar os dados da academia
- Os erros de permissão devem desaparecer

## Alternativa: Via Firebase CLI

Se preferir usar o terminal:

```bash
# 1. Instalar firebase-tools globalmente (se não tiver)
npm install -g firebase-tools

# 2. Fazer login
firebase login

# 3. Definir claims via script
firebase functions:shell
```

No shell do Firebase Functions:
```javascript
admin.auth().setCustomUserClaims('EXjQ5utfSGRBd9pQJVFmts5DxtC3', {
  role: 'admin',
  academiaId: 'Tgg6tZynnTbQUxeAFJAB'
})
```

## Verificação de Sucesso

Após aplicar os claims, o usuário deve conseguir:
- ✅ Acessar dados da academia `Tgg6tZynnTbQUxeAFJAB`
- ✅ Ver notificações da academia
- ✅ Navegar pelo app sem erros de permissão
- ✅ Acessar subcoleções da academia

## Próximos Passos

1. Aplicar claims para o usuário atual
2. Executar migração completa para outros usuários existentes
3. Testar fluxo de onboarding para novos usuários
4. Verificar regras de segurança do Firestore
