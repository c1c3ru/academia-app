# Guia de Deployment - Remoção do SuperAdmin

Este guia detalha os passos para fazer o deployment completo da nova arquitetura sem superAdmin com isolamento de dados por academia.

## 📋 Pré-requisitos

- Firebase CLI instalado e configurado
- Acesso de administrador ao projeto Firebase
- Backup dos dados atuais (recomendado)
- Node.js instalado para executar scripts

## 🚀 Passo 1: Deploy das Cloud Functions

### 1.1 Verificar o código das functions
```bash
cd functions
npm install
```

### 1.2 Fazer deploy das novas functions
```bash
firebase deploy --only functions
```

### 1.3 Verificar se as functions foram deployadas
No console do Firebase, verifique se as seguintes functions estão ativas:
- `createAcademy`
- `generateInvite` 
- `useInvite`
- `setUserClaims` (atualizada)
- `migrateExistingUsers` (atualizada)

## 🔒 Passo 2: Deploy das Regras do Firestore

### 2.1 Verificar as novas regras
Confirme que o arquivo `firestore.rules` contém:
- Remoção da função `isSuperAdmin()`
- Coleções globais desabilitadas
- Subcoleções por academia habilitadas
- Criação de academias apenas via Cloud Function

### 2.2 Fazer deploy das regras
```bash
firebase deploy --only firestore:rules
```

### 2.3 Testar as regras (opcional)
```bash
firebase emulators:start --only firestore
```

## 📦 Passo 3: Migração dos Dados

### 3.1 Configurar o script de migração
Edite o arquivo `scripts/migrate-global-collections.js`:
```javascript
// Substitua 'your-project-id' pelo ID do seu projeto
projectId: 'seu-projeto-firebase'
```

### 3.2 Executar a migração
```bash
cd scripts
node migrate-global-collections.js migrate
```

### 3.3 Verificar a migração
```bash
node migrate-global-collections.js verify
```

### 3.4 Limpar coleções antigas (OPCIONAL - CUIDADO!)
⚠️ **ATENÇÃO**: Execute apenas após verificar que tudo está funcionando
```bash
node migrate-global-collections.js cleanup
```

## 📱 Passo 4: Deploy do Código Cliente

### 4.1 Verificar as mudanças no cliente
Confirme que os seguintes arquivos foram atualizados:
- `src/services/academyCollectionsService.js` (novo)
- `src/screens/onboarding/AcademyOnboardingScreen.js` (novo)
- `src/components/ModalityPicker.js` (atualizado)
- `src/screens/admin/AdminModalities.js` (atualizado)
- `src/navigation/AppNavigator.js` (atualizado)

### 4.2 Testar localmente
```bash
npm start
# ou
expo start
```

### 4.3 Build e deploy
Para web:
```bash
npm run build
firebase deploy --only hosting
```

Para mobile:
```bash
eas build --platform all
```

## 🧪 Passo 5: Testes Completos

### 5.1 Testes de Segurança
- [ ] Verificar que usuários não conseguem acessar dados de outras academias
- [ ] Confirmar que apenas admins podem modificar dados da academia
- [ ] Testar que códigos de convite funcionam corretamente
- [ ] Verificar que apenas usuários autenticados podem criar academias

### 5.2 Testes Funcionais
- [ ] Criar nova academia (fluxo completo)
- [ ] Gerar código de convite
- [ ] Usar código de convite para associar usuário
- [ ] CRUD de modalidades, planos e avisos
- [ ] Navegação entre telas

### 5.3 Testes de Performance
- [ ] Tempo de carregamento das subcoleções
- [ ] Latência das Cloud Functions
- [ ] Responsividade da interface

## 🔧 Comandos Úteis

### Logs das Cloud Functions
```bash
firebase functions:log
```

### Monitorar regras do Firestore
```bash
firebase firestore:rules:get
```

### Rollback (se necessário)
```bash
# Restaurar functions anteriores
firebase functions:delete createAcademy
firebase functions:delete generateInvite
firebase functions:delete useInvite

# Restaurar regras anteriores
firebase deploy --only firestore:rules
```

## 🚨 Troubleshooting

### Erro: "Permission denied"
- Verificar se as regras do Firestore foram deployadas corretamente
- Confirmar que o usuário tem o `academiaId` nos Custom Claims

### Erro: "Function not found"
- Verificar se as Cloud Functions foram deployadas
- Checar logs das functions para erros

### Dados não aparecem
- Verificar se a migração foi executada corretamente
- Confirmar que o `academiaId` está correto no contexto do usuário

### Erro de navegação
- Verificar se o `AcademyOnboardingScreen` foi importado corretamente
- Confirmar que a lógica de navegação está atualizada

## 📊 Monitoramento Pós-Deploy

### Métricas para acompanhar:
- Taxa de sucesso na criação de academias
- Uso e expiração de códigos de convite
- Tentativas de acesso cross-academia (deve ser zero)
- Performance das Cloud Functions

### Logs importantes:
- Erros nas Cloud Functions
- Violações das regras do Firestore
- Falhas na migração de dados

## ✅ Checklist Final

- [ ] Cloud Functions deployadas e funcionando
- [ ] Regras do Firestore atualizadas
- [ ] Migração de dados concluída e verificada
- [ ] Código cliente deployado
- [ ] Testes de segurança aprovados
- [ ] Testes funcionais aprovados
- [ ] Monitoramento configurado
- [ ] Documentação atualizada
- [ ] Equipe treinada nas mudanças

## 🎉 Conclusão

Após completar todos os passos, sua aplicação terá:
- ✅ Isolamento completo de dados entre academias
- ✅ Eliminação do ponto único de falha (superAdmin)
- ✅ Controle granular de acesso por academia
- ✅ Fluxo de onboarding melhorado
- ✅ Arquitetura mais segura e escalável

Para suporte ou dúvidas, consulte a documentação completa em `docs/SUPERADMIN_REMOVAL_GUIDE.md`.
