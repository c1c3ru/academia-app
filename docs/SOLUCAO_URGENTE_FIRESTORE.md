# 🚨 SOLUÇÃO URGENTE - Erro de Permissões Firestore

## ⚡ AÇÃO IMEDIATA NECESSÁRIA

### 1. Acesse o Firebase Console
- URL: https://console.firebase.google.com
- Projeto: **academia-app-5cf79**

### 2. Configure as Regras do Firestore
1. Clique em **Firestore Database**
2. Clique na aba **Regras** (Rules)
3. **APAGUE TUDO** e cole este código:

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

4. Clique em **PUBLICAR** (Publish)
5. Aguarde 30 segundos

### 3. Reinicie o App
```bash
npx expo start --clear
```

### 4. Teste o Cadastro
- Use um **email diferente** (o erro `auth/email-already-in-use` indica que o email já existe)
- Exemplo: `teste2@email.com` em vez de `teste@email.com`

## ✅ Correções Já Implementadas
- Todos os ícones inválidos foram corrigidos
- `people` → `person`
- `checkmark-circle` → `checkmark`

## 🎯 Resultado Esperado
Após configurar as regras:
- ✅ Cadastro funcionará
- ✅ Login funcionará  
- ✅ Dashboard carregará sem erros
- ✅ Sem mais erros de permissão

**Esta é uma configuração temporária para teste. Em produção, use as regras de segurança completas do arquivo `firestore.rules`.**
